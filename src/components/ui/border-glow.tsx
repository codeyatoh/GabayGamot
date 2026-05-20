"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BorderGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
  glowColors?: string[];
}

export function BorderGlow({
  children,
  className,
  height,
  glowColors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#3B82F6"],
  ...props
}: BorderGlowProps) {
  const customHeight = height || "100%";
  const gradientString = glowColors.join(", ");

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden p-[1px] transition-all duration-300",
        className
      )}
      style={{ height: customHeight }}
      {...props}
    >
      {/* Inject custom CSS keyframes for rotation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes border-glow-rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .animate-border-glow {
              animation: border-glow-rotate 12s linear infinite;
            }
          `,
        }}
      />

      {/* Rotating Colorful Gradient Glow Behind Card */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden rounded-2xl">
        <div
          className="animate-border-glow absolute size-[150%] origin-center shrink-0 blur-sm"
          style={{
            background: `conic-gradient(from 0deg, ${gradientString})`,
          }}
        />
      </div>

      {/* Glassmorphism Inner Card Content Container */}
      <div className="relative flex h-full w-full flex-col justify-between rounded-[15px] bg-[#FFFFFF]/75 dark:bg-[#08111F]/80 backdrop-blur-3xl">
        {children}
      </div>
    </div>
  );
}
