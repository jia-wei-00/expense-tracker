import type { Session } from "@supabase/supabase-js";

type TSession = Session | null;

export interface ISessionStore {
  session: TSession;
  isSessionLoading: boolean;
  setSession: (session: TSession) => void;
  getSession: () => Promise<void>;
  getUserId: () => string | undefined;
}
