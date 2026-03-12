import { createAuthClient } from 'better-auth/react';
import { lastLoginMethodClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000',
  plugins: [lastLoginMethodClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
