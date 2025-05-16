import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { randomUUID } from "crypto";

export const student = pgTable(
  "student",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID().replace(/-/g, "")),
    studentId: text("student_id").notNull(),
    name: text("name").notNull(),
    nfcUid: text("nfc_uid").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (student) => ({
    uniqueStudentIdPerUser: uniqueIndex("unique_student_id_per_user").on(
      student.studentId,
      student.userId,
    ),
    uniqueNfcUidPerUser: uniqueIndex("unique_nfc_uid_per_user").on(
      student.nfcUid,
      student.userId,
    ),
  }),
);
