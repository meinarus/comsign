"use server";

import { db } from "@/db/db";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export async function updateName(userId: string, name: string) {
  return db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name });
}

export async function updateEmail(userId: string, email: string) {
  return db
    .update(user)
    .set({ email, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.email });
}

export async function updateEmailVerified(
  userId: string,
  emailVerified: boolean,
) {
  return db
    .update(user)
    .set({ emailVerified, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.emailVerified });
}
