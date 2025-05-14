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
import { User } from "@/types/user";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { adminActions } from "@/actions/admin";
import { toast } from "sonner";

type UserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  banned: z.boolean(),
  emailVerified: z.boolean(),
  role: z.enum(["user", "admin"]),
});

export default function EditInfo({ open, onOpenChange, user }: UserSheetProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      banned: false,
      emailVerified: false,
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        banned: user.banned,
        emailVerified: user.emailVerified,
        role: user.role,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;

    setLoading(true);
    try {
      if (data.name !== user.name) {
        await adminActions.setName(user.id, data.name);
      }
      if (data.email !== user.email) {
        await adminActions.setEmail(user.id, data.email);
      }

      if (data.banned !== user.banned) {
        await adminActions.setBanned(user.id, data.banned);
      }

      if (data.emailVerified !== user.emailVerified) {
        await adminActions.setEmailVerified(user.id, data.emailVerified);
      }

      if (data.role !== user.role) {
        await adminActions.setRole(user.id, data.role);
      }

      toast.success("User updated", {
        description: "Changes saved successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("User failed", {
        description: String(error) || "An unexpected error occurred.",
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
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
              name="banned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val === "true")}
                    value={String(field.value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Active</SelectItem>
                      <SelectItem value="true">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verified</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val === "true")}
                    value={String(field.value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
