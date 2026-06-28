import React, { useEffect, useState } from "react";
import { Animated, useColorScheme } from "react-native";
import { Box } from "@/components/ui/box";

const TypingDots = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dotColor = isDark ? "rgb(180,180,180)" : "rgb(110,110,110)";

  // Lazy-initialised once and stable across renders — no refs read during render.
  const [dots] = useState(() => [
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 150),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <Box className="flex-row items-center gap-[5px] py-[3px]">
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          className="w-[7px] h-[7px] rounded"
          style={{ backgroundColor: dotColor, opacity: dot }}
        />
      ))}
    </Box>
  );
};

export default TypingDots;
