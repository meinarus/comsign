"use server";

import { db } from "@/db/db";
import { attendance } from "@/db/schema/attendance";
import { student } from "@/db/schema/student";
import { AttendanceRecord } from "@/types/attendance";
import { eq, and, gte, lte, isNull, asc, desc } from "drizzle-orm";

const getDayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export async function recordTimeIn(
  userId: string,
  nfcUid: string,
): Promise<
  | {
      success: true;
      studentName: string;
      studentId: string;
      timeIn: Date;
    }
  | { error: string }
> {
  const found = await findStudent(userId, nfcUid);
  if (!found) return { error: "Unrecognized ID. Please use a valid ID." };

  const now = new Date();
  const { start, end } = getDayBounds();

  const [existing] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, found.id),
        gte(attendance.timeIn, start),
        lte(attendance.timeIn, end),
      ),
    );

  if (existing) {
    return { error: "You have already timed in today." };
  }

  const [newRecord] = await db
    .insert(attendance)
    .values({
      studentId: found.id,
      timeIn: now,
      timeOut: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    success: true,
    studentName: found.name,
    studentId: found.studentId,
    timeIn: newRecord.timeIn,
  };
}

export async function recordTimeOut(
  userId: string,
  nfcUid: string,
): Promise<
  | {
      success: true;
      studentName: string;
      studentId: string;
      timeOut: Date;
    }
  | { error: string }
> {
  const found = await findStudent(userId, nfcUid);
  if (!found) return { error: "Unrecognized ID. Please register your card." };

  const now = new Date();
  const { start, end } = getDayBounds();

  const [existing] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, found.id),
        gte(attendance.timeIn, start),
        lte(attendance.timeIn, end),
        isNull(attendance.timeOut),
      ),
    )
    .orderBy(desc(attendance.timeIn))
    .limit(1);

  if (!existing) {
    return { error: "No time in found. Please scan to time in first." };
  }

  const [updated] = await db
    .update(attendance)
    .set({
      timeOut: now,
      updatedAt: now,
    })
    .where(eq(attendance.id, existing.id))
    .returning();

  return {
    success: true,
    studentName: found.name,
    studentId: found.studentId,
    timeOut: updated.timeOut!,
  };
}

export async function listAttendance(
  userId: string,
  sortField: "createdAt" | "updatedAt",
  startDate?: string,
  endDate?: string,
  sortOrder: "asc" | "desc" = "asc",
): Promise<{
  data?: AttendanceRecord[];
  error?: string;
}> {
  try {
    const attendanceRecord = await db
      .select({
        id: attendance.id,
        studentName: student.name,
        studentId: student.studentId,
        timeIn: attendance.timeIn,
        timeOut: attendance.timeOut,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
      })
      .from(attendance)
      .innerJoin(
        student,
        and(eq(student.id, attendance.studentId), eq(student.userId, userId)),
      )
      .where(
        and(
          startDate
            ? gte(attendance[sortField], new Date(startDate))
            : undefined,
          endDate ? lte(attendance[sortField], new Date(endDate)) : undefined,
        ),
      )
      .orderBy(
        sortOrder === "asc"
          ? asc(attendance[sortField])
          : desc(attendance[sortField]),
      );

    return { data: attendanceRecord };
  } catch (err) {
    console.error("Failed to fetch attendance:", err);
    return { error: "Failed to fetch attendance" };
  }
}

async function findStudent(userId: string, nfcUid: string) {
  const [found] = await db
    .select({
      id: student.id,
      name: student.name,
      studentId: student.studentId,
    })
    .from(student)
    .where(and(eq(student.nfcUid, nfcUid), eq(student.userId, userId)));
  return found;
}

export async function getTodayAttendance(
  userId: string,
  nfcUid: string,
): Promise<
  | {
      data: {
        studentName: string;
        studentId: string;
        timeIn: Date | null;
        timeOut: Date | null;
      };
    }
  | {
      error: string;
    }
> {
  const found = await findStudent(userId, nfcUid);
  if (!found) return { error: "Unrecognized ID." };

  const { start, end } = getDayBounds();

  const [rec] = await db
    .select({
      timeIn: attendance.timeIn,
      timeOut: attendance.timeOut,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, found.id),
        gte(attendance.timeIn, start),
        lte(attendance.timeIn, end),
      ),
    );

  return {
    data: {
      studentName: found.name,
      studentId: found.studentId,
      timeIn: rec?.timeIn || null,
      timeOut: rec?.timeOut || null,
    },
  };
}
