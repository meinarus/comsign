import { VerifyPassword } from "@/components/auth/verify-password";
import { Navbar } from "@/components/shared/navbar";

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar>
        <VerifyPassword />
      </Navbar>
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
