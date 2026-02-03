export type TSignInPayload = {
  email: string;
  password: string;
};

export interface IAuthStore {
  isAuthLoading: boolean;
  /**
   * Inherit Supabase onAuthStateChange will update the session store
   */
  initialize: () => Promise<void>;
  /**
   * Sign in a user with email and password
   * @param email
   * @param password
   */
  signIn: (payload: TSignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
}
