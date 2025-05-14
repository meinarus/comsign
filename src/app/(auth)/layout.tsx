"use server";

import { Navbar } from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    if (session.user.role === "admin") {
      return redirect("/admin/dashboard");
    } else {
      return redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "default",
          })}
        >
          Log in
        </Link>
      </Navbar>
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
