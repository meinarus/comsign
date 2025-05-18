"use server";

import { cookies } from "next/headers";
import { verifyPassword } from "@/actions/verify-password";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";

const SECRET = process.env.BETTER_AUTH_SECRET!;

function signFlag(value: string) {
  const h = createHmac("sha256", SECRET);
  h.update(value);
  return `${value}.${h.digest("base64url")}`;
}

export async function reauthenticate(data: {
  password: string;
  userId: string;
  next: string;
}) {
  const ok = await verifyPassword(data);
  if (!ok) {
    return { success: false };
  }

  const signed = signFlag("1");

  (await cookies()).set({
    name: "reauthenticated",
    value: signed,
    path: "/dashboard",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: new URL(process.env.BETTER_AUTH_URL!).hostname,
  });

  redirect(data.next || "/dashboard");
}
