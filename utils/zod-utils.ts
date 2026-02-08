import { z, ZodType } from "zod";

function safeParseAny<S extends ZodType>(
  schema: S,
  input: unknown,
): z.infer<S> | undefined;

function safeParseAny<S extends ZodType>(
  schema: S,
  input: unknown,
  fallback: z.infer<S>,
): z.infer<S>;

function safeParseAny<S extends ZodType>(
  schema: S,
  input: unknown,
  fallback?: z.infer<S>,
): z.infer<S> | undefined {
  const value = schema.safeParse(input);
  return value.success ? value.data : fallback;
}

export { safeParseAny };
