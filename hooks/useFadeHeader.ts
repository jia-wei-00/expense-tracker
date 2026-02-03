import {
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

export const useFadeHeader = (threshold = 100) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const translateY = useDerivedValue(() => {
    const isShow = scrollY.value > threshold;
    return isShow ? 0 : scrollY.value - 100;
  });
  const opacity = useDerivedValue(() => {
    return scrollY.value / (threshold + 20);
  });
  return { translateY, scrollHandler, opacity };
};
