"use server";

import { Navbar } from "@/components/shared/navbar";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session) {
    if (session.user.role === "admin") {
      return redirect("/admin/dashboard");
    } else {
      return redirect("/scan");
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
