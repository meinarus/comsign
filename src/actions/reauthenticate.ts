"use server";

import { cookies } from "next/headers";
import { verifyPassword } from "@/actions/verify-password";

export async function reauthenticate(data: {
  password: string;
  userId: string;
}) {
  const ok = await verifyPassword(data);
  if (!ok) {
    return { success: false };
  }

  (await cookies()).set({
    name: "reauthenticated",
    value: "1",
    maxAge: 5 * 60,
    path: "/dashboard",
    httpOnly: true,
    sameSite: "lax",
  });

  return { success: true };
}
