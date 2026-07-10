export type TThemeMode = "light" | "dark" | "system";

export interface IThemeStore {
  mode: TThemeMode;
  setMode: (mode: TThemeMode) => void;
}
