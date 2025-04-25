import { Navbar } from "@/components/navbar";

const routes = [
  { name: "Home", path: "/" },
  { name: "Attendance", path: "/attendance" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar routes={routes} />
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
