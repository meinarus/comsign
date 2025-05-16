"use server";

import { db } from "@/db/db";
import { student } from "@/db/schema/student";
import { eq, and, InferSelectModel, ne } from "drizzle-orm";
import { NewStudent } from "@/types/student";

export type Student = InferSelectModel<typeof student>;

export async function createStudent(newStudent: NewStudent) {
  try {
    const existingStudentId = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.studentId, newStudent.studentId),
          eq(student.userId, newStudent.userId),
        ),
      )
      .then((res) => res[0]);

    const existingNfcUid = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.nfcUid, newStudent.nfcUid),
          eq(student.userId, newStudent.userId),
        ),
      )
      .then((res) => res[0]);

    let error = "";
    if (existingStudentId) error += "Student ID already exists|";
    if (existingNfcUid) error += "NFC UID already registered|";

    if (error) return { error: error.slice(0, -1) };

    await db.insert(student).values({
      ...newStudent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true };
  } catch {
    return { error: "Failed to create student" };
  }
}

export async function listStudents(userId: string): Promise<{
  data?: Student[];
  error?: string;
}> {
  try {
    const students = await db
      .select()
      .from(student)
      .where(eq(student.userId, userId))
      .orderBy(student.createdAt);

    return { data: students };
  } catch {
    return { error: "Failed to fetch students" };
  }
}

export async function setName(
  id: string,
  name: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const [updated] = await db
      .update(student)
      .set({ name, updatedAt: new Date() })
      .where(eq(student.id, id))
      .returning({ id: student.id });

    return updated ? { success: true } : { error: "Student not found" };
  } catch {
    return { error: "Failed to update name" };
  }
}

export async function setStudentId(
  id: string,
  studentId: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const [existing] = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.studentId, studentId),
          eq(student.userId, userId),
          ne(student.id, id),
        ),
      );

    if (existing) return { error: "Student ID already exists" };

    const [updated] = await db
      .update(student)
      .set({ studentId, updatedAt: new Date() })
      .where(eq(student.id, id))
      .returning({ studentId: student.studentId });

    return updated ? { success: true } : { error: "Student not found" };
  } catch {
    return { error: "Failed to update student id" };
  }
}

export async function setNfcUid(
  id: string,
  nfcUid: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const [existing] = await db
      .select()
      .from(student)
      .where(
        and(
          eq(student.nfcUid, nfcUid),
          eq(student.userId, userId),
          ne(student.id, id),
        ),
      );

    if (existing) return { error: "NFC UID already registered" };

    const [updated] = await db
      .update(student)
      .set({ nfcUid, updatedAt: new Date() })
      .where(eq(student.id, id))
      .returning({ nfcUid: student.nfcUid });

    return updated ? { success: true } : { error: "Student not found" };
  } catch {
    return { error: "Failed to update NFC UID" };
  }
}

export async function deleteStudent(id: string) {
  try {
    await db.delete(student).where(eq(student.id, id));
    return { success: true };
  } catch {
    return { error: "Failed to delete student" };
  }
}
