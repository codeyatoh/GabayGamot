"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#ai-command-insights", label: "AI Command Insights" },
  { href: "#team", label: "Team Section" },
  { href: "#faqs", label: "FAQs" },
];

const THEME_STORAGE_KEY = "gabaygamot-theme";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : prefersDark
          ? "dark"
          : "light";

    applyTheme(initialTheme);
    queueMicrotask(() => {
      setTheme(initialTheme);
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 4);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : "idle"}
        className={cn(
          "fixed top-0 z-50 w-full px-3 transition-all duration-300 md:px-4",
          "bg-[#F8FAFC]/90 backdrop-blur-lg dark:bg-[#08111F]/90",
          isScrolled ? "border-transparent" : "border-b border-[#E2E8F0]/80 dark:border-slate-800/60",
        )}
      >
        <div
          className={cn(
            "mx-auto mt-2 w-full transition-all duration-300",
            isScrolled ? "max-w-5xl" : "max-w-none",
          )}
        >
          <div
            className={cn(
              "px-4 py-3 transition-all duration-300",
              isScrolled
                ? "rounded-2xl border border-[#BFDBFE] bg-white/95 px-3 shadow-lg shadow-slate-200/50 backdrop-blur-xl dark:border-slate-500/35 dark:bg-[#0D1826]/95 dark:shadow-black/25"
                : "rounded-none border-0 bg-transparent shadow-none",
            )}
          >
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-full items-center justify-between gap-3 lg:w-auto">
                <Link className="flex min-w-0 items-center gap-3" href="/">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-[#EFF6FF] shadow-sm dark:border-slate-500/40 dark:bg-[#172338]">
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
                    <span className="block text-xs text-[#475569] dark:text-slate-300">
                      Barangay Portal
                    </span>
                  </span>
                </Link>

                <div className="flex items-center gap-2 lg:hidden">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={
                      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                    }
                    className="relative inline-flex size-10 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] transition hover:bg-[#EFF6FF] dark:border-slate-500/40 dark:bg-[#172338] dark:text-slate-50 dark:hover:bg-[#22314A]"
                  >
                    <Moon
                      className={cn(
                        "absolute size-4 text-[#2563EB] transition-all duration-200",
                        mounted && theme === "dark"
                          ? "scale-0 rotate-180 opacity-0"
                          : "scale-100 rotate-0 opacity-100",
                      )}
                    />
                    <Sun
                      className={cn(
                        "absolute size-4 text-[#F59E0B] transition-all duration-200",
                        mounted && theme === "dark"
                          ? "scale-100 rotate-0 opacity-100"
                          : "scale-0 -rotate-180 opacity-0",
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMenuOpen((value) => !value)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    className="relative inline-flex size-10 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] transition hover:bg-[#EFF6FF] dark:border-slate-500/40 dark:bg-[#172338] dark:text-slate-50 dark:hover:bg-[#22314A]"
                  >
                    <Menu
                      className={cn(
                        "absolute size-4 transition-all duration-200",
                        menuOpen
                          ? "scale-0 rotate-180 opacity-0"
                          : "scale-100 rotate-0 opacity-100",
                      )}
                    />
                    <X
                      className={cn(
                        "absolute size-4 transition-all duration-200",
                        menuOpen
                          ? "scale-100 rotate-0 opacity-100"
                          : "scale-0 -rotate-180 opacity-0",
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                <nav className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      className="rounded-xl px-3 py-2 text-sm font-semibold text-[#475569] transition-all duration-200 hover:bg-[#EFF6FF] hover:text-[#1D4ED8] dark:text-slate-200 dark:hover:bg-[#172338] dark:hover:text-[#93C5FD]"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                  }
                  className={cn(
                    "relative inline-flex size-10 items-center justify-center rounded-xl border text-[#1E293B] transition hover:bg-[#EFF6FF] dark:text-slate-50 dark:hover:bg-[#22314A]",
                    isScrolled
                      ? "border-[#CBD5E1] bg-white dark:border-slate-500/40 dark:bg-[#172338]"
                      : "border-[#CBD5E1]/80 bg-white/90 dark:border-slate-500/40 dark:bg-[#172338]",
                  )}
                >
                  <Moon
                    className={cn(
                      "absolute size-4 text-[#2563EB] transition-all duration-200",
                      mounted && theme === "dark"
                        ? "scale-0 rotate-180 opacity-0"
                        : "scale-100 rotate-0 opacity-100",
                    )}
                  />
                  <Sun
                    className={cn(
                      "absolute size-4 text-[#F59E0B] transition-all duration-200",
                      mounted && theme === "dark"
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-0 -rotate-180 opacity-0",
                    )}
                  />
                </button>

                <Button
                  asChild
                  className={cn("transition-all duration-300", isScrolled && "lg:hidden")}
                  size="sm"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "grid overflow-hidden transition-all duration-300 ease-out lg:hidden",
                menuOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 shadow-sm dark:border-slate-500/40 dark:bg-[#101B2D]">
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "block rounded-xl px-3 py-2 text-sm font-semibold text-[#1E293B] transition-all duration-200 hover:bg-white hover:text-[#1D4ED8] dark:text-slate-100 dark:hover:bg-[#172338] dark:hover:text-[#93C5FD]",
                          menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                        )}
                        style={{ transitionDelay: `${index * 40}ms` }}
                      >
                        {item.label}
                      </a>
                    ))}

                    <div
                      className={cn(
                        "pt-2 transition-all duration-200",
                        menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                      )}
                      style={{ transitionDelay: "120ms" }}
                    >
                      <Button asChild className="w-full">
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
