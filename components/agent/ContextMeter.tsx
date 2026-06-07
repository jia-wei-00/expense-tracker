import React from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { IContextMeter } from "@/types/components/agent/context-meter";

const formatTokens = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
};

const ContextMeter = ({ used, limit }: IContextMeter) => {
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;
  const pct = Math.round(ratio * 100);

  const tone =
    ratio >= 1
      ? "bg-error-500"
      : ratio >= 0.8
        ? "bg-warning-500"
        : "bg-primary-500";

  const textTone =
    ratio >= 1
      ? "text-error-600"
      : ratio >= 0.8
        ? "text-warning-600"
        : "text-typography-500";

  return (
    <HStack space="xs" className="items-center">
      <Box className="h-1 w-16 rounded-full bg-background-200 overflow-hidden">
        <Box
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${pct}%` }}
        />
      </Box>
      <Text size="xs" className={textTone}>
        {formatTokens(used)} / {formatTokens(limit)}
      </Text>
    </HStack>
  );
};

export default ContextMeter;
