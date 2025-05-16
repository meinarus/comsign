"use server";

import { auth } from "@/lib/auth";

export async function verifyPassword(data: {
  password: string;
  userId: string;
}) {
  const ctx = await auth.$context;
  const accounts = await ctx.internalAdapter.findAccounts(data.userId);
  const credentialAccount = accounts?.find(
    (account) => account.providerId === "credential",
  );
  if (!credentialAccount?.password) return false;
  return ctx.password.verify({
    hash: credentialAccount.password,
    password: data.password,
  });
}
