export interface ICurrencyStore {
  code: string;
  symbol: string;
  setCurrency: (code: string) => void;
}
