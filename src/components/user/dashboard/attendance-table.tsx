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
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord } from "@/types/attendance";
import { listAttendance } from "@/actions/attendance";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const calculateDuration = (timeIn: string, timeOut: string | null) => {
  if (!timeOut) return "-";

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

  try {
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

const getAttendanceStatus = (
  timeOut: string | null,
  recordDate: Date,
  viewMode: "daily" | "monthly" | "all",
) => {
  if (timeOut) return "Completed";

  if (viewMode === "daily" && isToday(recordDate)) {
    return "Pending";
  }

  return "Incomplete";
};

export default function AttendanceTable({ userId }: { userId: string }) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "all">(
    "daily",
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "studentName",
      header: "Name",
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
        const recordDate = new Date(row.getValue("createdAt"));
        return (
          <Badge
            variant={timeOut ? "default" : "secondary"}
            className="w-20 justify-center"
          >
            {getAttendanceStatus(timeOut, recordDate, viewMode)}
          </Badge>
        );
      },
    },
  ];

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let start: Date, end: Date;

      switch (viewMode) {
        case "daily":
          ({ start, end } = getDayRange(selectedDate));
          break;
        case "monthly":
          start = new Date(selectedYear, selectedMonth, 1);
          end = new Date(selectedYear, selectedMonth + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case "all":
          start = new Date(0);
          end = new Date();
          break;
      }

      const result = await listAttendance(
        userId,
        "createdAt",
        start.toISOString(),
        end.toISOString(),
      );

      if (result.error) throw new Error(result.error);
      setAttendanceRecords(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch records"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId, viewMode, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance, viewMode, selectedDate, selectedMonth, selectedYear]);

  const table = useReactTable({
    data: attendanceRecords,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  const exportToCsv = () => {
    if (table.getRowModel().rows.length === 0) {
      toast.warning("No records found to export");
      return;
    }

    const headers = table
      .getVisibleLeafColumns()
      .map((col) => col.columnDef.header as string);

    const rows = table.getRowModel().rows.map((row) =>
      table.getVisibleLeafColumns().map((col) => {
        const raw = row.getValue(col.id);

        if (col.id === "studentName" || col.id === "studentId") {
          return `="${String(raw).replace(/"/g, '""')}"`;
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

        if (col.id === "duration") {
          const timeIn = row.getValue<string>("timeIn");
          const timeOut = row.getValue<string | null>("timeOut");
          const duration = calculateDuration(timeIn, timeOut);
          return duration === "-" ? "" : duration;
        }

        if (col.id === "status") {
          const timeOut = row.getValue<string | null>("timeOut");
          const recordDate = new Date(row.getValue("createdAt"));
          return getAttendanceStatus(timeOut, recordDate, viewMode);
        }

        return String(raw ?? "");
      }),
    );

    const csvContent = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const getExportFilename = () => {
      const baseName = (() => {
        switch (viewMode) {
          case "daily":
            return `attendance-${format(selectedDate, "MM-dd-yyyy")}`;
          case "monthly":
            return `attendance-${months[selectedMonth].label}-${selectedYear}`;
          case "all":
            return `attendance-all-time`;
        }
      })();

      const searchSuffix = globalFilter
        ? `-${globalFilter.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        : "";

      return `${baseName}${searchSuffix}`;
    };

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${getExportFilename()}.csv`;
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={viewMode}
            onValueChange={(v: "daily" | "monthly" | "all") => setViewMode(v)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === "daily" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {viewMode === "monthly" && (
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() - 5 + i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex w-full gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search name or student ID..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-8"
              aria-label="Search attendance records"
            />
          </div>

          <Button onClick={exportToCsv} className="ml-auto">
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className="[&_td]:text-center [&_th]:text-center">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="text-destructive">{error.message}</div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
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
                <TableCell colSpan={columns.length} className="h-24">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
