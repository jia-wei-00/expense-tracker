import { create } from "zustand";
import storage from "@/lib/storage";
import { CURRENCIES, DEFAULT_CURRENCY_CODE } from "@/constants/currency";
import type { ICurrencyStore } from "@/types/store/useCurrency";

const CURRENCY_STORAGE_KEY = "currency";

const findCurrency = (code: unknown) =>
  CURRENCIES.find((currency) => currency.code === code);

// MMKV reads are synchronous, so the persisted currency is available on first render
const getInitialCurrency = () => {
  const stored = storage.getItem(CURRENCY_STORAGE_KEY);
  return findCurrency(stored) ?? findCurrency(DEFAULT_CURRENCY_CODE)!;
};

/**
 * useCurrency holds the user-selected currency, persisted in MMKV under "currency"
 */
export const useCurrencyStore = create<ICurrencyStore>((set) => ({
  code: getInitialCurrency().code,
  symbol: getInitialCurrency().symbol,
  setCurrency: (code) => {
    const currency = findCurrency(code);
    if (!currency) return;
    storage.setItem(CURRENCY_STORAGE_KEY, currency.code);
    set({ code: currency.code, symbol: currency.symbol });
  },
}));
