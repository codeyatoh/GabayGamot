import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#routes", label: "Routes" },
  { href: "#stack", label: "Stack" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0]/80 bg-[#F8FAFC]/95 backdrop-blur dark:border-white/10 dark:bg-[#0F172A]/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex size-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] shadow-sm dark:border-white/10 dark:bg-white/5">
            <Image
              alt="GabayGamot logo"
              className="size-7 object-contain"
              height={28}
              src="/assets/images/gabay-gamot-logo-sm.png"
              width={28}
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-sm font-semibold text-[#1E293B] dark:text-slate-100">
              GabayGamot
            </span>
            <span className="block text-xs text-[#64748B] dark:text-slate-400">
              Project foundation
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#60A5FA]"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button asChild size="sm">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}
