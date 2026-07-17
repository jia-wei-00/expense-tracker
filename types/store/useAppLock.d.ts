export interface IAppLockStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}
