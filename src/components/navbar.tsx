"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

interface Route {
  name: string;
  path: string;
}

export function Navbar({ routes }: { routes: Route[] }) {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <nav className="container mx-auto flex items-center justify-between p-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="ComSign Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold">ComSign</span>
        </Link>
        <div className="flex items-center gap-5">
          {routes.map((route) => (
            <Link
              href={route.path}
              key={route.path}
              className={
                pathname == route.path
                  ? "text-primary underline"
                  : "text-muted-foreground"
              }
            >
              {route.name}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant={pathname === "/login" ? "default" : "outline"}
            >
              <Link href="/login">Login</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
