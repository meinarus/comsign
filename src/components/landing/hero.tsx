import { buttonVariants } from "@/components/ui/button";
import { ArrowUpRight, ScanLine } from "lucide-react";
import React from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-8">
      <div className="max-w-2xl text-center">
        <Card className="flex w-full max-w-xl flex-col">
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl md:text-6xl md:leading-[1.2]">
            ComSign
          </h1>
          <ScanLine className="text-primary mx-auto h-16 w-16" />
          <p className="text-[17px] md:text-lg">
            An NFC-based attendance management system that makes it easy to
            record and manage attendance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className={buttonVariants({
                variant: "default",
                size: "lg",
              })}
            >
              Get Started
              <ArrowUpRight className="!h-5 !w-5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
