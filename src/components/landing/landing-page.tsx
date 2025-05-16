"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdCard, Lock } from "lucide-react";
import Link from "next/link";

export function LandingPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 sm:gap-8",
        className,
      )}
      {...props}
    >
      <header className="text-center">
        <h1 className="mb-2 text-2xl font-bold sm:text-4xl">
          Welcome to ComSign
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg">
          An NFC-based attendance management system
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex w-full max-w-md flex-col">
          <CardHeader className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <IdCard className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold sm:text-2xl">
              Attendance
            </CardTitle>
            <CardDescription>Record your attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-xs sm:text-sm">
              Scan your NFC ID to record your time in or out for the day
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button className="w-full" asChild>
              <Link href="/attendance">Scan Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex w-full max-w-md flex-col">
          <CardHeader className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold sm:text-2xl">
              Admin
            </CardTitle>
            <CardDescription>Manage the system</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-xs sm:text-sm">
              Sign in with your admin credentials to continue
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button asChild className="w-full">
              <Link href="/login">Continue</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
