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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Student } from "@/types/student";
import EditInfo from "@/components/user/dashboard/edit-info";
import { deleteStudent, listStudents } from "@/actions/student";
import { StudentForm } from "@/components/user/dashboard/student-form";
import CustomAlertDialog from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

export default function StudentsTable({ userId }: { userId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue("name")}</div>;
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
      accessorKey: "nfcUid",
      header: "NFC UID",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        return <div>{row.getValue("nfcUid")}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Added On",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(student);
                  setIsSheetOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(student);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await listStudents(userId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setStudents(result.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch students"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const table = useReactTable({
    data: students,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Search name or student ID..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto">
          <StudentForm userId={userId} refetchStudents={fetchStudents} />
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
                    Failed to load students: {error.message}
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

      <EditInfo
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        student={selectedStudent}
        refetchStudents={fetchStudents}
      />

      <CustomAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={async () => {
          const result = await deleteStudent(selectedStudent?.id || "");
          if (result?.error) toast.error(result.error);
          else toast.success("Student deleted");
          fetchStudents();
        }}
      />
    </div>
  );
}
