import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createGoogleGenerativeAI } from "npm:@ai-sdk/google";
import { generateText, tool } from "npm:ai@4.3.15";
import { z } from "npm:zod";

const google = createGoogleGenerativeAI({
  apiKey: Deno.env.get("GEMINI_API_KEY") ?? "",
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const addExpenseSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe(
      'Short description. Use the exact field name "name". Example: "coffee".',
    ),
  amount: z.number().positive().describe("Amount in MYR."),
  category: z
    .number()
    .describe(
      'Category ID. Use the exact field name "category". Never return "categoryId".',
    ),
  is_expense: z
    .boolean()
    .describe(
      'Use the exact field name "is_expense". Never return "expense_type".',
    ),
  spend_date: z
    .string()
    .describe(
      'Use the exact field name "spend_date". Return an ISO datetime string.',
    ),
});

const deleteExpenseSchema = z.object({
  id: z.number().describe("The expense ID to delete."),
});

type Category = {
  id: number;
  name: string;
  is_expense: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  messages: ChatMessage[];
  categories: Category[];
};

type AddExpenseArgs = z.infer<typeof addExpenseSchema>;
type DeleteExpenseArgs = z.infer<typeof deleteExpenseSchema>;

type PendingWriteToolCall =
  | {
      toolName: "addExpense";
      args: AddExpenseArgs;
    }
  | {
      toolName: "deleteExpense";
      args: DeleteExpenseArgs;
    };

const parsePendingWriteToolCalls = (
  result: Awaited<ReturnType<typeof generateText>>,
): PendingWriteToolCall[] => {
  const pendingWriteToolCalls: PendingWriteToolCall[] = [];

  for (const step of result.steps) {
    for (const toolResult of step.toolResults ?? []) {
      if (toolResult.toolName === "addExpense") {
        const parsed = addExpenseSchema.safeParse(toolResult.result);

        if (!parsed.success) {
          console.error("Invalid addExpense tool result", parsed.error.flatten());
          continue;
        }

        pendingWriteToolCalls.push({
          toolName: "addExpense",
          args: parsed.data,
        });
      }

      if (toolResult.toolName === "deleteExpense") {
        const parsed = deleteExpenseSchema.safeParse(toolResult.result);

        if (!parsed.success) {
          console.error(
            "Invalid deleteExpense tool result",
            parsed.error.flatten(),
          );
          continue;
        }

        pendingWriteToolCalls.push({
          toolName: "deleteExpense",
          args: parsed.data,
        });
      }
    }
  }

  return pendingWriteToolCalls;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: CORS_HEADERS,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const { messages, categories }: RequestBody = await req.json();

    const categoryList =
      categories.length > 0
        ? categories
            .map(
              (category) =>
                `- id:${category.id} name:"${category.name}" type:${category.is_expense ? "expense" : "income"}`,
            )
            .join("\n")
        : "No categories yet.";

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: `You are a helpful personal finance AI assistant embedded in an expense tracker app.
Today's date is ${new Date().toISOString().split("T")[0]}.
The user's currency is RM (Malaysian Ringgit).

The user has these expense/income categories:
${categoryList}

Rules:
- Always respond in the same language the user writes in.
- For add or delete actions, call a write tool and do not write a chat reply.
- For read-only questions, reply with a short friendly answer.
- For addExpense, always provide every required field.
- Use the exact field names: name, amount, category, is_expense, spend_date.
- Never use alternative keys like description, categoryId, category_id, expense_type, or type.
- Match the closest existing category id whenever possible.
- If the user does not specify a date, use today's date and return a full ISO datetime string.
- If the category is genuinely unclear, ask a clarifying question instead of guessing.`,
      messages,
      tools: {
        addExpense: tool({
          description:
            "Propose a new expense or income record for user confirmation.",
          parameters: addExpenseSchema,
          execute: async (args) => args,
        }),
        deleteExpense: tool({
          description: "Propose deleting an expense record by ID.",
          parameters: deleteExpenseSchema,
          execute: async (args) => args,
        }),
        listExpenses: tool({
          description: "List the user's expenses with optional filters.",
          parameters: z.object({
            category: z.number().optional(),
            from: z.string().optional().describe("Start date in ISO format."),
            to: z.string().optional().describe("End date in ISO format."),
            limit: z.number().optional().default(10),
          }),
          execute: async ({ category, from, to, limit }) => {
            let query = supabase
              .from("expense")
              .select(
                "id, name, amount, spend_date, is_expense, expense_category(name)",
              )
              .eq("user_id", user.id)
              .order("spend_date", { ascending: false })
              .limit(limit ?? 10);

            if (category) query = query.eq("category", category);
            if (from) query = query.gte("spend_date", from);
            if (to) query = query.lte("spend_date", to);

            const { data, error } = await query;

            if (error) return { error: error.message };

            return data ?? [];
          },
        }),
        getMonthlySummary: tool({
          description:
            "Get the user's total spending grouped by category for a given month.",
          parameters: z.object({
            month: z
              .string()
              .describe('Month in "YYYY-MM" format. Example: "2026-04".'),
          }),
          execute: async ({ month }) => {
            const { data, error } = await supabase.rpc("get_monthly_summary", {
              p_user_id: user.id,
              p_month: month,
            });

            if (error) return { error: error.message };

            return data;
          },
        }),
      },
      maxSteps: 3,
    });

    const pendingToolCalls = parsePendingWriteToolCalls(result);

    if (pendingToolCalls.length > 0) {
      return new Response(
        JSON.stringify({
          message: null,
          pendingToolCalls,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: result.text,
        pendingToolCalls: null,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  }
});
