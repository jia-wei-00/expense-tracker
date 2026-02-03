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
  const { scrollHandler, translateY, opacity } = useFadeHeader();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className={twJoin("flex-1", className)}
    >
      <Animated.View style={{ translateY, opacity }} className="z-50">
        <Box className="bg-background-0 p-4 shadow-lg absolute top-0 left-0 right-0">
          <Heading>{title}</Heading>
        </Box>
      </Animated.View>
      <Animated.ScrollView
        className="flex-1 px-2"
        onScroll={!!title ? scrollHandler : undefined}
        scrollEventThrottle={16}
      >
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Container;
