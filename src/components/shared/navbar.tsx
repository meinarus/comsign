"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/shared/mode-toggle";
import Image from "next/image";

interface NavbarProps {
  children?: React.ReactNode;
  className?: string;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <header className="bg-muted sticky top-0 z-50 flex border-b">
      <nav className="container mx-auto flex items-center justify-between p-3 xl:px-30">
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

        <div className="flex items-center gap-2">
          {children}
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}
