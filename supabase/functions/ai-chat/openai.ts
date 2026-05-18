import OpenAI from "npm:openai";

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: Deno.env.get("OPENROUTER_API_KEY")!,
});
