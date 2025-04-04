"use client";

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
import { toast } from "sonner";

export default function LandingPage() {
  return (
    <section className="max-w-4xl">
      <header className="mb-4 text-center md:mb-8">
        <h1 className="mb-2 text-2xl font-bold md:text-4xl">
          Welcome to ComSign
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg">
          An NFC-based attendance management system
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <IdCard className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold md:text-2xl">
              Attendance
            </CardTitle>
            <CardDescription>Record your attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-xs md:text-sm">
              Scan your NFC ID to record your time in or out for the day
            </p>
          </CardContent>
          <CardFooter>
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
            <CardTitle className="text-xl font-bold md:text-2xl">
              Admin
            </CardTitle>
            <CardDescription>Manage the system</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-xs md:text-sm">
              Sign in with your admin credentials to continue
            </p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button
              asChild
              className="w-full"
              onClick={() => toast("Event has been created")}
            >
              <Link href="/login">Continue</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
