import React, { useEffect } from 'react';
import { config } from './config';
import { Appearance, View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';
import { systemColorScheme } from 'react-native-css-interop/dist/runtime/native/appearance-observables';

export type ModeType = 'light' | 'dark' | 'system';

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    // RN 0.85's Appearance.setColorScheme never emits the JS change event that
    // nativewind's listener depends on, and the "follow system" reset value is
    // now 'unspecified' (null crashes) — so sync Appearance and nativewind's
    // observable ourselves instead of going through nativewind's setColorScheme.
    if (mode === 'system') {
      Appearance.setColorScheme('unspecified');
      systemColorScheme.set(
        Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
      );
    } else {
      Appearance.setColorScheme(mode);
      systemColorScheme.set(mode);
    }
  }, [mode]);

  const resolvedScheme = mode === 'system' ? (colorScheme ?? 'light') : mode;

  return (
    <View
      style={[
        config[resolvedScheme],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
