"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/student";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { setName, setNfcUid, setStudentId } from "@/actions/student";

type StudentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  refetchStudents: () => void;
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  studentId: z
    .string()
    .length(10, "Student ID must be 10 characters including dashes"),
  nfcUid: z.string().length(10, "NFC UID must be 10 characters"),
});

export default function EditInfo({
  open,
  onOpenChange,
  student,
  refetchStudents,
}: StudentSheetProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      studentId: "",
      nfcUid: "",
    },
  });

  useEffect(() => {
    if (student && open) {
      form.reset({
        name: student.name,
        studentId: student.studentId,
        nfcUid: student.nfcUid,
      });
    }
  }, [student, form, open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!student) return;

    try {
      setLoading(true);
      const updates = [];

      if (data.name !== student.name) {
        updates.push(setName(student.id, data.name));
      }

      if (data.studentId !== student.studentId) {
        updates.push(setStudentId(student.id, data.studentId, student.userId));
      }

      if (data.nfcUid !== student.nfcUid) {
        updates.push(setNfcUid(student.id, data.nfcUid, student.userId));
      }

      if (updates.length === 0) {
        toast.info("No changes detected");
        onOpenChange(false);
        return;
      }

      const results = await Promise.all(updates);

      let hasErrors = false;

      results.forEach((result) => {
        if ("error" in result) {
          hasErrors = true;
          if (result.error.includes("Student ID")) {
            form.setError("studentId", {
              type: "manual",
              message: result.error,
            });
          } else if (result.error.includes("NFC UID")) {
            form.setError("nfcUid", {
              type: "manual",
              message: result.error,
            });
          } else {
            form.setError("root", {
              type: "manual",
              message: result.error,
            });
          }
        }
      });

      if (!hasErrors) {
        toast.success("Student updated successfully");
        refetchStudents();
        onOpenChange(false);
      }
    } catch {
      form.setError("root", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-2">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>Make changes and save them.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="edit-user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 p-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input required className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input
                      type="studentId"
                      required
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nfcUid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input
                      type="nfcUid"
                      required
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter>
          <Button
            type="submit"
            form="edit-user-form"
            className="mt-4 w-full"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
          <SheetClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
