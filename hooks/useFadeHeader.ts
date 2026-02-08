// hooks/useFadeHeader.ts
import {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const THRESHOLD = 100;

export const useFadeHeader = () => {
  const scrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(-60); // start hidden above
  const headerOpacity = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      const shouldShow = scrollY.value >= THRESHOLD;

      // show when >= 100, hide when < 100
      headerTranslateY.value = withTiming(shouldShow ? 0 : -60, {
        duration: 200,
      });
      headerOpacity.value = withTiming(shouldShow ? 1 : 0, { duration: 200 });
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: headerOpacity.value,
  }));

  return {
    scrollHandler,
    animatedHeaderStyle,
  };
};
