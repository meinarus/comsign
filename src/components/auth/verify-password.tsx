"use client";

import { useState, useTransition } from "react";
import { reauthenticate } from "@/actions/reauthenticate";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

const formSchema = z.object({
  password: z.string(),
});

export function VerifyPassword() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session) {
      return null;
    }

    startTransition(async () => {
      const { success } = await reauthenticate({
        password: values.password,
        userId: session.user.id,
      });

      if (!success) {
        form.setError("password", {
          type: "manual",
          message: "Incorrect password",
        });
        form.setValue("password", "");
      } else {
        form.reset();
        setIsOpen(false);
        router.push("/dashboard");
      }
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
        }
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={isLoading}>Dashboard</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Your Identity</DialogTitle>
          <DialogDescription>
            We need to confirm it’s really you
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your password"
                      required
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Confirm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
