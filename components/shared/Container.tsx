import { useFadeHeader } from "@/hooks/useFadeHeader";
import React from "react";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { twJoin } from "tailwind-merge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";

const Container = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) => {
  const { scrollHandler, animatedHeaderStyle } = useFadeHeader();

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
      <Animated.View style={animatedHeaderStyle} className="z-50">
        <Box className="bg-background-0 p-4 absolute top-0 left-0 right-0 border-b border-outline-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <Heading>{title}</Heading>
        </Box>
      </Animated.View>
      <Animated.ScrollView
        className={twJoin("px-3", className)}
        onScroll={!!title ? scrollHandler : undefined}
        contentContainerStyle={{ paddingBottom: 12 }}
        scrollEventThrottle={16}
      >
        {title && (
          <Heading size="2xl" className="my-5">
            {title}
          </Heading>
        )}
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Container;
