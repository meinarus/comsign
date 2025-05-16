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
import { AttendanceRecord } from "@/types/attendance";
import { listAttendance } from "@/actions/attendance";

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
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue("studentName")}</div>;
      },
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => {
        return <div>{row.getValue("studentId")}</div>;
      },
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
        return (
          <div>
            {time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "timeOut",
      header: "Time Out",
      cell: ({ row }) => {
        const time = new Date(row.getValue("timeOut"));
        return (
          <div>
            {time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
        );
      },
    },
  ];

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await listAttendance(userId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setAttendanceRecords(result.data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch attendance records"),
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
        if (col.id === "createdAt") {
          const d = new Date(raw as string);
          return d.toLocaleDateString();
        }
        if (col.id === "timeIn" || col.id === "timeOut") {
          const t = new Date(raw as string);
          return t.toLocaleTimeString([], {
            hour: "numeric",
            minute: "numeric",
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
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-4 py-2 text-center"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 px-4 py-2 text-center"
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
                  className="h-24 px-4 py-2 text-center"
                >
                  <div className="text-destructive">
                    Failed to load attendance records: {error.message}
                  </div>
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
                  className="h-24 px-4 py-2 text-center"
                >
                  No results.
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
