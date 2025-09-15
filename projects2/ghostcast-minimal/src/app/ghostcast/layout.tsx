"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Audio Generator", href: "/ghostcast/audio-generator" },
  { name: "Auto-Transcription", href: "/ghostcast/auto-transcription" },
  { name: "ScrollCaster", href: "/ghostcast/scroll-caster" },
];

export default function GhostCastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1f1f2a] bg-[#0e0e1a]/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/ghostcast" className="flex items-center space-x-2">
              <Icons.logo className="size-6" />
              <span className="text-[#ff4411] font-bold font-cyberpunk text-lg">GhostCast</span>
              <span className="text-[#f5f5f5] font-cyberpunk text-sm">|</span>
              <span className="text-[#00FFFF] font-cyberpunk text-sm">FlameOS</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-[#1a1a2a] text-[#ff4411]"
                        : "text-gray-300 hover:bg-[#1a1a2a] hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium font-cyberpunk"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400 font-cyberpunk">
                <span className="text-[#ff4411]">Ghost King</span> | NODE-0001
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f2a] bg-[#0e0e1a] py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#ff4411] font-bold font-cyberpunk">GhostCast</span>
          </div>
          <div className="text-sm text-gray-400">
            Built by{" "}
            <span className="text-[#ff4411] font-cyberpunk">GodsIMiJ AI Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
