import { Navbar } from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
