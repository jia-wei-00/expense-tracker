import { useFadeHeader } from "@/hooks/useFadeHeader";
import React from "react";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { twJoin } from "tailwind-merge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

type ScrollHandler = ReturnType<typeof useFadeHeader>["scrollHandler"];

type RenderProps = {
  scrollHandler: ScrollHandler;
};

type ContainerProps = {
  /**
   * Pass a ReactNode for normal scrollable pages.
   * Pass a render function to bring your own scroller (e.g. AnimatedFlashList) —
   * use the provided scrollHandler and header inside your list.
   */
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  className?: string;
  title?: string;
  refreshControl?: React.ReactElement;
};

const Container = ({
  children,
  className,
  title,
  refreshControl,
}: ContainerProps) => {
  const { scrollHandler, animatedHeaderStyle } = useFadeHeader();

  const header = title ? (
    <Heading size="2xl" className="my-5">
      {title}
    </Heading>
  ) : null;

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
      {typeof children === "function" ? (
        <VStack className={twJoin("flex-1 px-3", className)}>
          {header}
          {children({ scrollHandler })}
        </VStack>
      ) : (
        <>
          {title ? (
            <Animated.View style={animatedHeaderStyle} className="z-50">
              <Box className="bg-background-0 p-4 absolute top-0 left-0 right-0 border-b border-outline-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                <Heading>{title}</Heading>
              </Box>
            </Animated.View>
          ) : null}
          <Animated.ScrollView
            className={twJoin("px-3", className)}
            onScroll={!!title ? scrollHandler : undefined}
            contentContainerStyle={{ paddingBottom: 12 }}
            scrollEventThrottle={16}
            refreshControl={refreshControl}
          >
            {header}
            {children}
          </Animated.ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default Container;
