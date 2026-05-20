"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const suffixes = ["None", "Jr.", "Sr.", "II", "III", "IV", "V"];

interface SuffixDropdownProps {
  value: string;
  onChange: (val: string) => void;
  defaultValue?: string;
  name?: string;
}

export function SuffixDropdown({
  value,
  onChange,
  defaultValue = "",
  name = "suffix",
}: SuffixDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Controlled: use value prop if provided, else defaultValue
  const currentVal = value !== undefined ? value : defaultValue;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
      >
        <span>{currentVal || "None / Select Suffix"}</span>
        <ChevronsUpDown className="size-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="py-1 text-xs font-bold text-slate-400 dark:text-slate-500 px-3 uppercase tracking-wider">
            Suffixes
          </div>
          {suffixes.map((suffix) => {
            const actualSuffix = suffix === "None" ? "" : suffix;
            const isSelected = currentVal === actualSuffix;
            return (
              <button
                key={suffix}
                type="button"
                onClick={() => {
                  onChange(actualSuffix);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
              >
                <span>{suffix}</span>
                {isSelected && (
                  <Check className="size-4 text-[#2563EB] dark:text-[#60A5FA]" />
                )}
              </button>
            );
          })}
        </div>
      )}
      <input type="hidden" name={name} value={currentVal} />
    </div>
  );
}
