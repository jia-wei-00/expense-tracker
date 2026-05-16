import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createGoogleGenerativeAI } from "npm:@ai-sdk/google";
import { z } from "npm:zod";

const google = createGoogleGenerativeAI({
  apiKey: Deno.env.get("GEMINI_API_KEY")!,
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: categories, error: catError } = await supabase
      .from("expense_category")
      .select("id, name, is_expense")
      .order("name");

    console.log(categories, "categories from supabase db");

    if (catError) {
      console.error("Failed to fetch categories:", catError.message);
      return Response.json(
        { error: "Failed to load categories" },
        { status: 500 },
      );
    }

    const { messages } = await req.json();

    const categoryText = (categories ?? [])
      .map(
        (c: { id: number; name: string; is_expense: boolean }) =>
          `  - id: ${c.id}, name: "${c.name}", type: ${c.is_expense ? "expense" : "income"}`,
      )
      .join("\n");

    const result = await generateText({
      model: google("gemini-2.5-flash-lite"),
      system: `You are a friendly expense tracking assistant for ${user.email}.
              Today is ${new Date().toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
              Currency is MYR (Malaysian Ringgit).
              The user's available categories:
              ${categoryText}

            Rules:
            - Always use the category ID (number) when calling tools, not the name.
            - Match the user's description to the closest category.
            - If unsure which category fits, ask for clarification.
            - For ADD or DELETE actions, call the tool immediately — do NOT write a reply message. The app will show a confirmation UI to the user.
            - For READ actions (list, summary), just answer directly.
            - Keep replies short and friendly.`,
      messages,
      tools: {
        addExpense: {
          description:
            "Extract and return a complete expense or income record from the user's message. Fill every required field with normalized values.",
          parameters: z.object({
            name: z
              .string()
              .min(1)
              .max(80)
              .describe(
                'Extract a short transaction name from the user input. Use only the core label, not the full sentence. Do not include amount, currency, date, or filler words. Examples: "add coffee expense RM50" -> "coffee", "spent RM18 on grab ride" -> "grab ride", "salary came in" -> "salary".',
              ),
            description: z
              .string()
              .max(200)
              .optional()
              .describe(
                "Optional extra note only if the user explicitly provides useful detail.",
              ),
            amount: z
              .number()
              .positive()
              .finite()
              .describe(
                "Amount in MYR as a positive number only. Example: 16.5",
              ),
            category_id: z
              .number()
              .int()
              .positive()
              .describe(
                "Numeric category ID from the provided category list only. Must match the intended transaction type.",
              ),
            is_expense: z
              .boolean()
              .describe(
                "true for expense, false for income. Must match the selected category's is_expense value.",
              ),
            spend_date: z
              .string()
              .datetime()
              .describe(
                "Transaction datetime in ISO 8601 format. Use current datetime only if the user did not specify one.",
              ),
            date: z.string().optional(),
          }),
        },
        deleteExpense: {
          description: "Propose deleting an expense record by ID",
          parameters: z.object({
            id: z.number().describe("The expense ID to delete"),
          }),
          // No execute() — frontend handles on confirm
        },
        listExpenses: {
          description: "List the user's expenses with optional filters",
          parameters: z.object({
            category: z.number().optional(),
            from: z.string().optional().describe("Start date in ISO format"),
            to: z.string().optional().describe("End date in ISO format"),
            limit: z.number().optional().default(10),
          }),
          execute: async ({ category, from, to, limit }) => {
            let query = supabase
              .from("expense")
              .select(
                "id, name, amount, spend_date, is_expense, expense_category(name)",
              )
              .order("spend_date", { ascending: false })
              .limit(limit ?? 10);

            if (category) query = query.eq("category", category);
            if (from) query = query.gte("spend_date", from);
            if (to) query = query.lte("spend_date", to);

            const { data, error } = await query;
            if (error) return { error: error.message };
            return data;
          },
        },
        getMonthlySummary: {
          description:
            "Get total spending grouped by category for a given month",
          parameters: z.object({
            month: z.string().describe("Month in YYYY-MM format, e.g. 2026-04"),
          }),
          execute: async ({ month }) => {
            const { data, error } = await supabase.rpc("get_monthly_summary", {
              p_user_id: user.id,
              p_month: month,
            });
            if (error) return { error: error.message };
            return data;
          },
        },
      },
      maxSteps: 3,
    });

    // ---- Check for unexecuted write tool calls ----
    const WRITE_TOOLS = ["addExpense", "deleteExpense"];

    function normalizeAddExpenseArgs(raw: Record<string, unknown>) {
      return {
        name: String(raw.name ?? raw.description ?? raw.title ?? ""),
        amount: Number(raw.amount ?? 0),
        category: Number(raw.category ?? raw.category_id ?? 0),
        is_expense:
          raw.is_expense !== undefined ? Boolean(raw.is_expense) : true,
        spend_date: String(
          raw.spend_date ?? raw.date ?? new Date().toISOString(),
        ),
      };
    }

    console.log(
      "Full steps:",
      JSON.stringify(
        result.steps.map((s) => ({
          text: s.text,
          toolCalls: s.toolCalls,
          toolResults: s.toolResults,
          finishReason: s.finishReason,
        })),
        null,
        2,
      ),
    );

    const pendingToolCalls = result.steps
      .flatMap((step) => step.toolCalls ?? [])
      .filter((tc) => WRITE_TOOLS.includes(tc.toolName));

    // ✅ If write action detected — return pendingToolCall only, no message needed
    if (pendingToolCalls.length > 0) {
      return Response.json(
        {
          message: null,
          pendingToolCalls: pendingToolCalls.map((tc) => {
            const raw = ((tc as any).input ?? tc.args ?? {}) as Record<
              string,
              unknown
            >;
            return {
              toolName: tc.toolName,
              args:
                tc.toolName === "addExpense"
                  ? normalizeAddExpenseArgs(raw)
                  : raw,
            };
          }),
        },
        { headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }

    // ✅ No write action — return AI reply as normal
    return Response.json(
      {
        message: result.text,
        pendingToolCall: null,
      },
      { headers: { "Access-Control-Allow-Origin": "*" } },
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
});
