
<img width="300" alt="Screenrecorder-2026-05-17-20-09-26-79" src="https://github.com/user-attachments/assets/99713192-2a57-42e3-9a75-a36a60bb96c9" />

# Expense Tracker

A personal finance tracking app built with React Native and Expo. Track expenses and income, manage loans, and use an AI assistant to log transactions by text or photo.

## Features

### Dashboard (Home)
- Monthly expense and income summary with interactive donut pie charts
- Category breakdown with color-coded legend
- Month selector to navigate between months
- Recent transactions list with quick access to details

### Expense & Income Management
- Add transactions with name, amount, category, date, and optional description
- Edit or delete existing transactions
- Supports both expense and income types
- Per-user categories (expense and income types)

### Transaction History
- Paginated list of all transactions across all months
- Bulk select and delete with checkbox UI
- Tap any item to view full details and edit

### Loan Tracker
- Create named loan accounts
- Record individual payment entries per loan
- Track loan repayment history

### AI Agent
- Chat-based assistant powered by OpenRouter (OpenAI-compatible)
- Add or delete transactions by describing them in natural language
- Upload a photo (receipt, bill, screenshot) — the AI reads it and extracts transaction details
- List and summarize your expenses by asking in plain language
- Confirmation UI before any write action is committed to the database
- Supports per-item removal from a pending batch before confirming
- Markdown-rendered AI responses

### Settings
- Language switcher: English and Chinese (简体中文)
- Sign out

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (v55) |
| Routing | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| AI | OpenRouter via OpenAI SDK (Deno edge function) |
| State | Zustand (auth) + TanStack Query (server data) |
| UI | Gluestack UI v3 + NativeWind v4 (Tailwind CSS) |
| Forms | react-hook-form + Zod |
| i18n | react-i18next (en-US, zh-CN) |
| Storage | React Native MMKV |
| Charts | react-native-gifted-charts |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio or Xcode (for device emulation)
- A Supabase project

### Environment Variables

Create a `.env` file at the root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
EXPO_PUBLIC_MMKV_ENCRYPTION_KEY=your_mmkv_key
```

Set the following as Supabase Edge Function secrets:

```
OPENROUTER_API_KEY=your_openrouter_key
```

### Install & Run

```bash
npm install
npm start          # Expo dev server
npm run android    # Build & run on Android emulator
npm run ios        # Build & run on iOS simulator
```

### Supabase Setup

```bash
supabase start     # Start local Supabase stack
supabase functions deploy ai-chat
```

Create a public storage bucket named `chat-images` in the Supabase dashboard for AI image uploads (8 MB limit, allowed types: JPEG, PNG, WebP, HEIC).

## Project Structure

```
app/
  (tabs)/         # Bottom tab screens: home, loan, agent, history, settings
  expense/        # Add, view, and edit expense screens
  loan/           # Loan detail screen
  login.tsx       # Auth screen (sign in / sign up)
components/
  agent/          # Chat UI: bubble, input, pending action panel
  history/        # History list item
  home/           # Dashboard chart and legend
  shared/         # Reusable components (Container, TransactionItem, etc.)
  ui/             # Gluestack UI primitives
hooks/            # TanStack Query hooks and Supabase subscriptions
store/            # Zustand stores (auth, session)
supabase/
  functions/
    ai-chat/      # Deno edge function — OpenAI SDK + OpenRouter
i18n/
  locales/        # en-US and zh-CN translation files
types/            # TypeScript interfaces for components, hooks, store
```
