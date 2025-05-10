import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const { signIn, signOut, signUp, getSession, useSession } =
  createAuthClient({
    plugins: [adminClient()],
  });
