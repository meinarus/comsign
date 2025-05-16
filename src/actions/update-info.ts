"use server";

import { db } from "@/db/db";
import { user } from "@/db/schema/auth";
import { and, eq, ne } from "drizzle-orm";

export async function updateName(userId: string, name: string) {
  return db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name });
}

export async function updateEmail(
  userId: string,
  email: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const [existing] = await db
      .select()
      .from(user)
      .where(and(eq(user.email, email), ne(user.id, userId)));

    if (existing) {
      return { error: "Email already in use" };
    }

    const [updated] = await db
      .update(user)
      .set({ email, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    return updated ? { success: true } : { error: "User not found" };
  } catch (error) {
    console.error("Failed to update email:", error);
    return { error: "Failed to update email" };
  }
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
