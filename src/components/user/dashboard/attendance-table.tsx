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
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "@/types/attendance";
import { listAttendance } from "@/actions/attendance";

const calculateDuration = (timeIn: string, timeOut: string | null) => {
  if (!timeOut) return "-";

  try {
    const createRoundedDate = (isoString: string) => {
      const d = new Date(isoString);
      return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
      );
    };

    const start = createRoundedDate(timeIn);
    const end = createRoundedDate(timeOut);
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

export default function AttendanceTable({ userId }: { userId: string }) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

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
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "timeIn",
      header: "Time In",
      cell: ({ row }) => {
        const time = new Date(row.getValue("timeIn"));
        return time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
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
              hour: "2-digit",
              minute: "2-digit",
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

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await listAttendance(userId);

      if (result.error) throw new Error(result.error);
      setAttendanceRecords(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch records"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const table = useReactTable({
    data: attendanceRecords,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  const exportToCsv = () => {
    const headers = table
      .getVisibleLeafColumns()
      .map((col) => col.columnDef.header as string);

    const rows = table.getRowModel().rows.map((row) =>
      table.getVisibleLeafColumns().map((col) => {
        const raw = row.getValue(col.id);

        if (col.id === "duration") {
          const timeIn = row.getValue<string>("timeIn");
          const timeOut = row.getValue<string | null>("timeOut");
          const duration = calculateDuration(timeIn, timeOut);
          return duration === "-" ? "" : duration;
        }

        if (col.id === "status") {
          return getAttendanceStatus(row.getValue<string | null>("timeOut"));
        }

        if (col.id === "createdAt") {
          const d = new Date(raw as string);
          return d.toLocaleDateString();
        }

        if (col.id === "timeIn" || col.id === "timeOut") {
          if (!raw) return "";
          const t = new Date(raw as string);
          return t.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        return String(raw ?? "");
      }),
    );

    const csvContent = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-4">
        <Input
          placeholder="Search name or student ID..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            className="ml-auto"
            variant="secondary"
            size="sm"
            onClick={exportToCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>
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
                  <div className="text-destructive">{error.message}</div>
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
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
