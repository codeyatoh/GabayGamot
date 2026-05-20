"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
}

export function ShineBorder({
  borderRadius = 24,
  borderWidth = 2,
  duration = 8,
  color = ["#2563EB", "#06B6D4", "#14B8A6"], // Medical blue, cyan, teal
  className,
  children,
  ...props
}: ShineBorderProps) {
  const colorString = Array.isArray(color) ? color.join(", ") : color;

  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
        } as React.CSSProperties
      }
      className={cn(
        "relative rounded-[var(--border-radius)] p-[var(--border-width)] overflow-hidden bg-slate-200/80 dark:bg-slate-800/80 shadow-md",
        className
      )}
      {...props}
    >
      {/* Spinning glow background */}
      <div
        className="absolute -inset-[150%] -z-10 animate-shine-border"
        style={{
          background: `conic-gradient(from 0deg, transparent 30%, ${colorString} 50%, transparent 70%)`,
        }}
      />
      {/* Content wrapper */}
      <div className="relative w-full h-full bg-white dark:bg-[#101B2D] rounded-[calc(var(--border-radius)-var(--border-width))]">
        {children}
      </div>
    </div>
  );
}
