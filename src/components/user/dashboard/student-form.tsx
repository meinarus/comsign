"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { createStudent } from "@/actions/student";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StudentFormProps {
  userId: string;
  refetchStudents: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  studentId: z
    .string()
    .length(10, "Student ID must be 10 characters including dashes"),
  nfcUid: z.string().length(10, "NFC UID must be 10 characters"),
});

export function StudentForm({ userId, refetchStudents }: StudentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      studentId: "",
      nfcUid: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await createStudent({
        ...values,
        userId: userId,
      });

      if (result?.error) {
        let hasFieldErrors = false;

        result.error.split("|").forEach((error) => {
          if (error.includes("Student ID")) {
            form.setError("studentId", {
              type: "manual",
              message: error,
            });
            hasFieldErrors = true;
          }
          if (error.includes("NFC UID")) {
            form.setError("nfcUid", {
              type: "manual",
              message: error,
            });
            hasFieldErrors = true;
          }
        });

        if (hasFieldErrors) return;
        throw new Error(result.error);
      }

      toast.success("Student Added Successfully");
      refetchStudents();
      setOpen(false);
      form.reset();
    } catch (error) {
      if (!(error instanceof Error && error.message.includes("already"))) {
        toast.error("Error Creating Student", {
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Student</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            Fill in the details of the student you want to add.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="name"
                      placeholder="Enter name"
                      required
                      {...field}
                    />
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
                      placeholder="Enter Student ID"
                      required
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
                  <FormLabel>NFC UID</FormLabel>
                  <FormControl>
                    <Input
                      type="nfcUid"
                      placeholder="Enter NFC UID"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
