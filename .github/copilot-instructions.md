# Copilot Instructions

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Build & run on Android emulator
npm run ios        # Build & run on iOS simulator
npm run lint       # Run ESLint (eslint-config-expo/flat)
```

No test suite is configured.

## Architecture

This is a React Native / Expo app (file-based routing via expo-router) backed by Supabase.

**Routing** (`app/`): expo-router file-based routing. `app/_layout.tsx` uses `Stack.Protected` for auth guarding — unauthenticated users see `login`, authenticated users see `(tabs)`. The tab group has: `index` (home dashboard), `loan` (loan management), `explore` (browse all), `settings`.

**State management — two layers:**
- **Zustand stores** (`store/`) for auth/session state: `useAuthStore` (sign-in/sign-out actions), `useSessionStore` (holds the current `Session` and exposes `getUserId()`). These two are intentionally separate — use `useSessionStore` to read the user, `useAuthStore` to mutate auth.
- **TanStack Query hooks** (`hooks/`) for all server data: `useInfiniteExpenses`, `useFetchMonthlyExpenses`, `useCategory`, etc. Mutations (`useAddExpense`, `useUpdateExpense`, `useDeleteExpense`) use `useMutation` and invalidate/update the query cache on success.

**Real-time sync**: `useExpenseSubscription` and `useCategorySubscription` are called in `(tabs)/_layout.tsx`. They subscribe to Supabase Realtime `postgres_changes` and directly update TanStack Query's in-memory cache (via `queryClient.setQueryData`) rather than triggering a refetch.

**Database types**: Auto-generated from Supabase into `database.types.ts`. Domain types in `types/` extend these — e.g. `IExpense` extends `TExpense` with a resolved `category: string` (the join result is flattened on fetch).

**Supabase tables**: `expense` (tracks both expenses and incomes via `is_expense: boolean`), `expense_category` (per-user categories, also typed via `is_expense`), `loan` (user-owned loan names), and `loan_record` (individual payment records for each loan). All queries filter by `user_id` from the session.

**Local storage**: `react-native-mmkv` (via `lib/storage.ts`) is used as the storage adapter for both Supabase auth session persistence and Zustand `persist` middleware.

## Key Conventions

**Component file structure**: Components are organized under `components/` by scope:
- `components/shared/` — reusable components used across multiple pages (e.g. `Container`, `ControlledInput`, `TransactionItem`)
- `components/ui/` — Gluestack UI primitives
- `components/<page-name>/` — components scoped to a specific page; if a page screen has multiple distinct sections, extract each section into its own component file and place it here (e.g. `components/home/chart.tsx`, `components/home/legend.tsx`, `components/expense-details/input-form.tsx`, `components/login/LoginForm.tsx`)

When a page file grows beyond a single logical block, break it into named section components and park them under `components/<page-name>/`. Keep the `app/` route files thin — they should primarily compose these section components.

**Forms**: Pages that take user input wrap with `<FormProvider {...methods}>` and use Controlled components from `components/shared/` (`ControlledInput`, `ControlledDropdown`, `ControlledRadio`). Zod schemas live in `types/page/` and are factory functions that accept the i18next `t` function to produce translated validation messages:
```ts
export const createAddExpenseSchema = (t: TFunction) => z.object({ ... });
export type TAddExpenseInput = z.input<ReturnType<typeof createAddExpenseSchema>>;
export type TAddExpenseOutput = z.infer<ReturnType<typeof createAddExpenseSchema>>;
```
Always export both `Input` and `Output` types when the schema uses `.transform()`.

**UI components**: Use Gluestack UI components from `components/ui/` (Box, Button, Text, Heading, HStack, VStack, etc.) and NativeWind Tailwind classes for layout/spacing. `twJoin` / `twMerge` (via `cn()` in `lib/utils.ts`) for conditional class merging. Icons are from `lucide-react-native`, wrapped via `<Icon as={LucideIcon} />`.

**Page layout**: Wrap each screen in `<Container title="...">` (`components/shared/Container.tsx`), which provides a `SafeAreaView`, animated sticky header, and a scrollable body.

**i18n**: All user-facing strings use `useTranslation("namespace")` from `react-i18next`. Locale files are in `i18n/locales/en-US/` and `i18n/locales/zh-CN/`. The active language is persisted in MMKV under the key `"language"`. Translations are **dynamically loaded per namespace** — always pass the namespace explicitly to `useTranslation` (e.g. `useTranslation("home")`, `useTranslation("auth")`). Never call `useTranslation()` without a namespace; doing so falls back to a default bundle and the correct strings will not load.

**Component prop types**: All component prop interfaces must be defined in `types/components/<folder>/<component-kebab>.d.ts`. Never declare prop interfaces inline inside component files. For example, `ILoanCard` lives in `types/components/loan/loan-card.d.ts` and is imported into `components/loan/LoanCard.tsx`.

**Delete confirmations**: All delete actions use `components/shared/ActionSheet.tsx` — never `Alert.alert`. Pattern: hold an `isOpen` boolean state, pass it and a `primaryButtonAction` async handler to `ActionSheet`.

**Mutation input vs response data**: Supabase `.delete()` (without `.select()`) returns `null` — you cannot read deleted row fields from `onSuccess(data)`. When post-delete logic depends on fields from the deleted row (e.g., to conditionally invalidate a month-based query key), pass those fields as part of the mutation input variables and read them via `onSuccess(_, variables)`.

**Query keys**: All TanStack Query keys are defined in `constants/query-key.ts` as `QUERY_KEY.*`. Monthly expense summaries use a `"YYYY-MM"` string directly as the key.

**FlashList separators**: Always define `ItemSeparatorComponent` as a stable named component outside the main function — never as an inline arrow function. An inline `() => <.../>` is recreated on every render, causing FlashList to skip separator rendering entirely. Pattern:
```tsx
const Separator = () => <Box className="h-2" />;
// then inside JSX:
<FlashList ItemSeparatorComponent={Separator} ... />
```

**Nested Stack layouts / double headers**: When adding a `_layout.tsx` inside a sub-directory (e.g. `app/expense/_layout.tsx`), the root `app/_layout.tsx` Stack will also render a header for that segment. Prevent the double header by adding `headerShown: false` on the root Stack screen for that segment:
```tsx
<Stack.Screen name="expense" options={{ headerShown: false }} />
```
Screen titles inside the nested layout use the `common` namespace (e.g. `t("expense.add")`).

**TypeScript**: Never use `as` type casts. They silence TypeScript errors and hide bugs in downstream code — if a cast seems necessary, fix the type definition or use a type guard instead.

**Environment variables**: Must be prefixed `EXPO_PUBLIC_` to be exposed to the app.
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_MMKV_ENCRYPTION_KEY`
