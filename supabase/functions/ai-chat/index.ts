import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: Deno.env.get("OPENROUTER_API_KEY")!,
});

const WRITE_TOOLS = ["addExpense", "deleteExpense"];

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "addExpense",
      description:
        "Extract and return a complete expense or income record from the user's message. Fill every required field with normalized values.",
      parameters: {
        type: "object",
        required: ["name", "amount", "category_id", "is_expense", "spend_date"],
        additionalProperties: false,
        properties: {
          name: {
            type: "string",
            description:
              'Extract a short transaction name from the user input. Use only the core label, not the full sentence. Do not include amount, currency, date, or filler words. Examples: "add coffee expense RM50" -> "coffee", "spent RM18 on grab ride" -> "grab ride", "salary came in" -> "salary". You MUST return a name this is REQUIRED!',
          },
          description: {
            type: "string",
            description:
              "Optional extra note only if the user explicitly provides useful detail.",
          },
          amount: {
            type: "number",
            description: "Amount in MYR as a positive number only. Example: 16.5",
          },
          category_id: {
            type: "integer",
            description:
              "Numeric category ID from the provided category list only. Must match the intended transaction type.",
          },
          is_expense: {
            type: "boolean",
            description:
              "true for expense, false for income. Must match the selected category's is_expense value.",
          },
          spend_date: {
            type: "string",
            description:
              'Transaction datetime in ISO 8601 format for the field "spend_date". Convert clearly understood user dates into ISO 8601 datetime. Examples: "2026-05-01" -> "2026-05-01T00:00:00", "2026-05-01 8pm" -> "2026-05-01T20:00:00". If the user does not provide a date, use the current datetime. If the user provides an ambiguous or unclear date format, such as "01-05-2026" where day/month order is uncertain, do not guess; ask for clarification instead.',
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteExpense",
      description: "Propose deleting an expense record by ID.",
      parameters: {
        type: "object",
        required: ["id"],
        additionalProperties: false,
        properties: {
          id: { type: "integer", description: "The expense ID to delete" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listExpenses",
      description: "List the user's expenses with optional filters.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: { type: "integer" },
          from: { type: "string", description: "Start date in ISO format" },
          to: { type: "string", description: "End date in ISO format" },
          limit: { type: "integer", default: 10 },
        },
      },
    },
  },
];

function normalizeAddExpenseArgs(raw: Record<string, unknown>) {
  return {
    name: String(raw.name ?? raw.description ?? raw.title ?? ""),
    amount: Number(raw.amount ?? 0),
    category: Number(raw.category ?? raw.category_id ?? 0),
    is_expense: raw.is_expense !== undefined ? Boolean(raw.is_expense) : true,
    spend_date: String(raw.spend_date ?? raw.date ?? new Date().toISOString()),
  };
}

const CORS = { "Access-Control-Allow-Origin": "*" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...CORS,
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

    if (catError) {
      console.error("Failed to fetch categories:", catError.message);
      return Response.json({ error: "Failed to load categories" }, { status: 500 });
    }

    const { messages: rawMessages } = await req.json();

    const categoryText = (categories ?? [])
      .map(
        (c: { id: number; name: string; is_expense: boolean }) =>
          `  - id: ${c.id}, name: "${c.name}", type: ${c.is_expense ? "expense" : "income"}`,
      )
      .join("\n");

    // Build OpenAI-format message history
    const history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (
      rawMessages ?? []
    ).map((msg: any) => {
      if (typeof msg.content === "string") {
        return { role: msg.role, content: msg.content };
      }
      return {
        role: msg.role,
        content: (msg.content as any[]).map((part: any) => {
          if (part.type === "text") return { type: "text", text: part.text };
          if (part.type === "image") {
            return { type: "image_url", image_url: { url: part.url } };
          }
          return part;
        }),
      };
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a friendly expense tracking assistant for ${user.email}.
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
      },
      ...history,
    ];

    let lastResponseText: string | null = null;

    for (let step = 0; step < 3; step++) {
      const response = await openai.chat.completions.create({
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
      });

      const msg = response.choices[0].message;
      messages.push(msg);
      lastResponseText = typeof msg.content === "string" ? msg.content : null;

      if (!msg.tool_calls || msg.tool_calls.length === 0) break;

      const pendingWriteToolCalls: { toolName: string; args: Record<string, unknown> }[] = [];
      const toolResults: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];

      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments ?? "{}");

        if (WRITE_TOOLS.includes(tc.function.name)) {
          pendingWriteToolCalls.push({
            toolName: tc.function.name,
            args:
              tc.function.name === "addExpense"
                ? normalizeAddExpenseArgs(args)
                : args,
          });
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: "pending_confirmation",
          });
        } else if (tc.function.name === "listExpenses") {
          let query = supabase
            .from("expense")
            .select(
              "id, name, amount, spend_date, is_expense, expense_category(name)",
            )
            .order("spend_date", { ascending: false })
            .limit(args.limit ?? 10);

          if (args.category) query = query.eq("category", args.category);
          if (args.from) query = query.gte("spend_date", args.from);
          if (args.to) query = query.lte("spend_date", args.to);

          const { data, error } = await query;
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(error ? { error: error.message } : data),
          });
        }
      }

      if (pendingWriteToolCalls.length > 0) {
        return Response.json(
          { message: null, pendingToolCalls: pendingWriteToolCalls },
          { headers: CORS },
        );
      }

      messages.push(...toolResults);
    }

    return Response.json(
      { message: lastResponseText, pendingToolCall: null },
      { headers: CORS },
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS },
    );
  }
});
