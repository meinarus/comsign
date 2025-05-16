import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { student } from "@/db/schema/student";
import { randomUUID } from "crypto";

export const attendance = pgTable("attendance", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID().replace(/-/g, "")),
  studentId: text("student_id")
    .notNull()
    .references(() => student.id, { onDelete: "cascade" }),
  timeIn: timestamp("time_in").notNull(),
  timeOut: timestamp("time_out"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
