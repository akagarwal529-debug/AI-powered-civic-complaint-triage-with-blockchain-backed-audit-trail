"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Report" },
    { href: "/admin", label: "Dashboard" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <nav className="glass-2 sticky top-0 z-50 border-b border-blue-500/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            CT
          </div>
          <div>
            <div className="font-bold text-lg gradient-text leading-none">
              CivicTriage AI
            </div>
            <div className="text-[10px] text-blue-300/50 tracking-[0.2em] uppercase mt-0.5">
              Fix the present
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-blue-950/40 border border-blue-500/10">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-500/20 text-blue-200 shadow-sm shadow-blue-500/20"
                    : "text-blue-300/60 hover:text-blue-100 hover:bg-blue-500/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs text-blue-300 font-medium">Live</span>
        </div>
      </div>

      <div className="md:hidden border-t border-blue-500/10 px-6 py-2 flex gap-1 overflow-x-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                active
                  ? "bg-blue-500/20 text-blue-200"
                  : "text-blue-300/60"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}