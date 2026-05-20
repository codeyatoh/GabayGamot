"use client";

import { useState } from "react";

export function ContactNumberInput({
  defaultValue = "",
  id = "contactNumber",
  name = "contactNumber",
  required = true,
  onChange,
}: {
  defaultValue?: string;
  id?: string;
  name?: string;
  required?: boolean;
  onChange?: (val: string) => void;
}) {
  // Handle default value sanitization (+63 / 0)
  const getInitialDigits = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.startsWith("63")) {
      clean = clean.slice(2);
    } else if (clean.startsWith("0")) {
      clean = clean.slice(1);
    }
    return clean.slice(0, 10);
  };

  const [digits, setDigits] = useState(() => getInitialDigits(defaultValue));

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Only digits
    if (val.length > 0 && val[0] !== "9") {
      return;
    }
    if (val.length > 10) {
      val = val.slice(0, 10);
    }
    setDigits(val);
    if (onChange) {
      onChange(val ? "+63" + val : "");
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-sm font-semibold text-slate-400 dark:text-slate-500">
          +63
        </span>
        <input
          type="tel"
          placeholder="912 345 6789"
          required={required}
          value={digits}
          onChange={handleContactNumberChange}
          className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] pl-14 pr-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
        />
      </div>
      <input type="hidden" name={name} id={id} value={digits ? "+63" + digits : ""} />
    </div>
  );
}
