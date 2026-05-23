import React, { useEffect, useRef } from "react";
import { Animated, useColorScheme } from "react-native";
import { Box } from "@/components/ui/box";

const TypingDots = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dotColor = isDark ? "rgb(180,180,180)" : "rgb(110,110,110)";

  const dot0 = useRef(new Animated.Value(0.3));
  const dot1 = useRef(new Animated.Value(0.3));
  const dot2 = useRef(new Animated.Value(0.3));

  useEffect(() => {
    const dotValues = [dot0.current, dot1.current, dot2.current];
    const animations = dotValues.map((dot, i) =>
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
  }, []);

  return (
    <Box className="flex-row items-center gap-[5px] py-[3px]">
      {[dot0, dot1, dot2].map((dot, i) => (
        <Animated.View
          key={i}
          className="w-[7px] h-[7px] rounded"
          style={{ backgroundColor: dotColor, opacity: dot.current }}
        />
      ))}
    </Box>
  );
};

export default TypingDots;
