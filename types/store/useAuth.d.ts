export type TSignInPayload = {
  email: string;
  password: string;
};

export type TSignUpPayload = {
  email: string;
  password: string;
};

export type TSignUpResult = {
  needsEmailConfirmation: boolean;
};

export interface IAuthStore {
  isAuthLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (payload: TSignInPayload) => Promise<void>;
  signUp: (payload: TSignUpPayload) => Promise<TSignUpResult>;
  signOut: () => Promise<void>;
}
