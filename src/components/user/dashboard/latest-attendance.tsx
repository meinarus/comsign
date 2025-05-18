"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "@/types/attendance";
import { listAttendance } from "@/actions/attendance";

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const calculateDuration = (timeIn: string, timeOut: string | null) => {
  if (!timeOut) return "-";

  try {
    const truncateSeconds = (dateStr: string) => {
      const d = new Date(dateStr);
      return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
      );
    };

    const start = truncateSeconds(timeIn);
    const end = truncateSeconds(timeOut);
    const diff = end.getTime() - start.getTime();

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  } catch {
    return "-";
  }
};

const getAttendanceStatus = (timeOut: string | null) => {
  return timeOut ? "Completed" : "Pending";
};

// const isTodayLocal = (date: Date) => {
//   const today = new Date();
//   return (
//     date.getFullYear() === today.getFullYear() &&
//     date.getMonth() === today.getMonth() &&
//     date.getDate() === today.getDate()
//   );
// };

export default function LatestAttendance({ userId }: { userId: string }) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "studentName",
      header: "Student Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("studentName")}</div>
      ),
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => <div>{row.getValue("studentId")}</div>,
    },
    {
      accessorKey: "timeIn",
      header: "Time In",
      cell: ({ row }) => {
        const time = new Date(row.getValue("timeIn"));
        return time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "numeric",
        });
      },
    },
    {
      accessorKey: "timeOut",
      header: "Time Out",
      cell: ({ row }) => {
        const raw = row.getValue<string | null>("timeOut");
        return raw
          ? new Date(raw).toLocaleTimeString([], {
              hour: "numeric",
              minute: "numeric",
            })
          : "-";
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const timeIn = row.getValue<string>("timeIn");
        const timeOut = row.getValue<string | null>("timeOut");
        return <div>{calculateDuration(timeIn, timeOut)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const timeOut = row.getValue<string | null>("timeOut");
        return (
          <Badge
            variant={timeOut ? "default" : "secondary"}
            className="min-w-[100px] justify-center"
          >
            {getAttendanceStatus(timeOut)}
          </Badge>
        );
      },
    },
  ];

  const fetchLatestAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      const { start, end } = getTodayRange();

      const result = await listAttendance(
        userId,
        "updatedAt",
        start.toISOString(),
        end.toISOString(),
        "desc",
      );

      if (result.error) throw new Error(result.error);

      setAttendanceRecords((result.data || []).slice(0, 5));
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch attendance"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLatestAttendance();
  }, [fetchLatestAttendance]);

  const table = useReactTable({
    data: attendanceRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-2 text-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="text-destructive">Error: {error.message}</div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-2 text-center whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No attendance records today
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
