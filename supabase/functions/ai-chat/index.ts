import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createGoogleGenerativeAI } from "npm:@ai-sdk/google";
import { streamText, tool } from "npm:ai@4.3.15";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod";

const google = createGoogleGenerativeAI({
  apiKey: Deno.env.get("GEMINI_API_KEY") ?? "",
});

interface Category {
  id: number;
  name: string;
  is_expense: boolean;
}

interface RequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  categories: Category[];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

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
  } = await supabase.auth.getUser();
  if (!user) {
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
            (c) =>
              `- id:${c.id} name:"${c.name}" type:${c.is_expense ? "expense" : "income"}`,
          )
          .join("\n")
      : "No categories yet.";

  const systemPrompt = `You are a helpful personal finance AI assistant embedded in an expense tracker app.
Today's date is ${new Date().toISOString().split("T")[0]}.
The user's currency is RM (Malaysian Ringgit).

The user has these expense/income categories:
${categoryList}

You have two tools:

1. parse_expenses — Call this when the user describes expenses or income they want to log.
   Match to the closest existing category by id where possible.
   If no suitable category exists, set category_id to null and is_new_category to true.
   Default spend_date to today if the user does not specify.
   IMPORTANT: When you call parse_expenses, do NOT output any additional text — the app will present the parsed items to the user as an editable review card. Only call the tool; do not say anything else.

2. query_expenses — Call this when the user asks about their spending history.
   After the tool returns data, write a friendly, concise summary with the totals and a breakdown by category.

Always respond in the same language the user writes in. Be concise and friendly.`;

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages,
    tools: {
      parse_expenses: tool({
        description:
          "Parse user's natural language description into structured expense/income items ready to be reviewed and saved.",
        parameters: z.object({
          items: z.array(
            z.object({
              name: z
                .string()
                .describe("Short description of the expense or income"),
              amount: z.number().positive().describe("Amount in RM"),
              is_expense: z
                .boolean()
                .describe("true for expense, false for income"),
              spend_date: z
                .string()
                .describe(
                  "ISO date string YYYY-MM-DD. Default to today if not specified.",
                ),
              category_name: z
                .string()
                .describe("Display name of the category"),
              category_id: z
                .number()
                .nullable()
                .describe(
                  "Existing category id, or null if new category needed",
                ),
              is_new_category: z
                .boolean()
                .describe(
                  "true if no existing category matched and a new one should be created",
                ),
            }),
          ),
        }),
        execute: async ({ items }) => ({ items }),
      }),

      query_expenses: tool({
        description:
          "Query the user's expense/income data for a time period and return a summary.",
        parameters: z.object({
          period: z
            .enum(["today", "week", "month", "year", "custom"])
            .describe("Time period to query"),
          type: z
            .enum(["expense", "income", "all"])
            .describe("Filter by expense, income, or both"),
          start_date: z
            .string()
            .optional()
            .describe("Start date YYYY-MM-DD (for custom period)"),
          end_date: z
            .string()
            .optional()
            .describe("End date YYYY-MM-DD (for custom period)"),
        }),
        execute: async ({ period, type, start_date, end_date }) => {
          const now = new Date();
          let startISO: string;
          let endISO = now.toISOString();

          switch (period) {
            case "today": {
              const s = new Date(now);
              s.setHours(0, 0, 0, 0);
              startISO = s.toISOString();
              break;
            }
            case "week": {
              const s = new Date(now);
              s.setDate(now.getDate() - now.getDay());
              s.setHours(0, 0, 0, 0);
              startISO = s.toISOString();
              break;
            }
            case "month": {
              startISO = new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
              ).toISOString();
              break;
            }
            case "year": {
              startISO = new Date(now.getFullYear(), 0, 1).toISOString();
              break;
            }
            default: {
              startISO = start_date
                ? new Date(start_date).toISOString()
                : new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1,
                  ).toISOString();
              if (end_date) {
                endISO = new Date(`${end_date}T23:59:59`).toISOString();
              }
            }
          }

          let query = supabase
            .from("expense")
            .select(
              "amount, is_expense, name, spend_date, expense_category(name)",
            )
            .eq("user_id", user.id)
            .gte("spend_date", startISO)
            .lte("spend_date", endISO);

          if (type === "expense") query = query.eq("is_expense", true);
          if (type === "income") query = query.eq("is_expense", false);

          const { data, error } = await query;
          if (error) return { error: error.message };

          const rows = data ?? [];
          const totalExpense = rows
            .filter((r) => r.is_expense)
            .reduce((s, r) => s + (r.amount ?? 0), 0);
          const totalIncome = rows
            .filter((r) => !r.is_expense)
            .reduce((s, r) => s + (r.amount ?? 0), 0);

          const byCategory: Record<string, number> = {};
          for (const row of rows) {
            const cat =
              (row.expense_category as { name: string } | null)?.name ??
              "Uncategorized";
            byCategory[cat] = (byCategory[cat] ?? 0) + (row.amount ?? 0);
          }

          return {
            period,
            totalExpense,
            totalIncome,
            transactionCount: rows.length,
            byCategory,
          };
        },
      }),
    },
    maxSteps: 3,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          let line: string | null = null;
          if (part.type === "text-delta") {
            line = `0:${JSON.stringify(part.textDelta)}\n`;
          } else if (part.type === "tool-result") {
            line = `a:${JSON.stringify({
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              result: part.result,
            })}\n`;
          } else if (part.type === "finish") {
            line = `d:${JSON.stringify({ finishReason: part.finishReason })}\n`;
          }
          if (line) controller.enqueue(encoder.encode(line));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-vercel-ai-data-stream": "v1",
      ...CORS_HEADERS,
    },
  });
});
