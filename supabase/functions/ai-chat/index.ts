import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";
import { TOOLS, promptMessage } from "./tools.ts";
import { openai } from "./openai.ts";
import { WRITE_TOOLS } from "./write-tools.ts";
import { normalizeAddExpenseArgs } from "./utils.ts";

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
      return Response.json(
        { error: "Failed to load categories" },
        { status: 500 },
      );
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

    const messages = promptMessage({
      email: user.email,
      categoryText,
      history,
    });

    let lastResponseText: string | null = null;

    for (let step = 0; step < 3; step++) {
      const response = await openai.chat.completions.create({
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        messages,
        tools: TOOLS,
      });

      const msg = response.choices[0].message;
      messages.push(msg);
      lastResponseText = typeof msg.content === "string" ? msg.content : null;

      if (!msg.tool_calls || msg.tool_calls.length === 0) break;

      const pendingWriteToolCalls: {
        toolName: string;
        args: Record<string, unknown>;
      }[] = [];
      const toolResults: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] =
        [];

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

      console.log(
        "Full steps:",
        JSON.stringify(
          {
            pendingWriteToolCalls,
            messages,
          },
          null,
          2,
        ),
      );

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
