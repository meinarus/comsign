export interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  timeIn: Date;
  timeOut: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
