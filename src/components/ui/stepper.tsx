"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Context ────────────────────────────────────────────────────────────────────

type StepperContextValue = {
  value: number;
  onValueChange: (v: number) => void;
  total: number;
  indicators?: {
    completed?: React.ReactNode;
    loading?: React.ReactNode;
  };
};

const StepperContext = React.createContext<StepperContextValue>({
  value: 1,
  onValueChange: () => {},
  total: 1,
});

type StepItemContextValue = {
  step: number;
  state: "active" | "completed" | "inactive";
};

const StepItemContext = React.createContext<StepItemContextValue>({
  step: 1,
  state: "inactive",
});

// ── Stepper root ───────────────────────────────────────────────────────────────

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  onValueChange: (v: number) => void;
  indicators?: StepperContextValue["indicators"];
  children: React.ReactNode;
}

function Stepper({ value, onValueChange, indicators, children, className, ...props }: StepperProps) {
  const total = React.useMemo(() => {
    let count = 0;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && (child as React.ReactElement<{ className?: string }>).props.className?.includes("stepper-nav")) count++;
    });
    return count;
  }, [children]);

  return (
    <StepperContext.Provider value={{ value, onValueChange, total: total || 1, indicators }}>
      <div data-slot="stepper" className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// ── StepperNav ────────────────────────────────────────────────────────────────

interface StepperNavProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function StepperNav({ children, className, ...props }: StepperNavProps) {
  // Count StepperItems to set total
  const ctx = React.useContext(StepperContext);
  const total = React.Children.count(children);

  // Patch total into context via a wrapper hack: re-render with correct total
  // We use a separate inner provider to override total
  return (
    <StepperContext.Provider value={{ ...ctx, total }}>
      <div
        data-slot="stepper-nav"
        className={cn(
          "group/stepper-nav flex flex-row data-[orientation=horizontal]:flex-row",
          className
        )}
        data-orientation="horizontal"
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// ── StepperItem ───────────────────────────────────────────────────────────────

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  children: React.ReactNode;
}

function StepperItem({ step, children, className, ...props }: StepperItemProps) {
  const { value } = React.useContext(StepperContext);
  const state: StepItemContextValue["state"] =
    value > step ? "completed" : value === step ? "active" : "inactive";

  return (
    <StepItemContext.Provider value={{ step, state }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        className={cn("group/step", className)}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

// ── StepperTrigger ────────────────────────────────────────────────────────────

interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function StepperTrigger({ children, className, ...props }: StepperTriggerProps) {
  return (
    <button
      data-slot="stepper-trigger"
      type="button"
      className={cn("flex items-start gap-2.5 text-left", className)}
      {...props}
    >
      {children}
    </button>
  );
}

// ── StepperIndicator ──────────────────────────────────────────────────────────

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function StepperIndicator({ children, className, ...props }: StepperIndicatorProps) {
  const { state } = React.useContext(StepItemContext);
  const { indicators } = React.useContext(StepperContext);

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-all duration-200",
        className
      )}
      {...props}
    >
      {state === "completed" && indicators?.completed
        ? indicators.completed
        : state === "active" && indicators?.loading
          ? indicators.loading
          : children}
    </div>
  );
}

// ── StepperTitle ──────────────────────────────────────────────────────────────

interface StepperTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

function StepperTitle({ children, className, ...props }: StepperTitleProps) {
  return (
    <p
      data-slot="stepper-title"
      className={cn("text-sm font-semibold leading-none", className)}
      {...props}
    >
      {children}
    </p>
  );
}

// ── StepperSeparator ──────────────────────────────────────────────────────────

type StepperSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

function StepperSeparator({ className, ...props }: StepperSeparatorProps) {
  const { state } = React.useContext(StepItemContext);

  return (
    <div
      data-slot="stepper-separator"
      data-state={state}
      className={cn(
        "h-0.5 flex-1 transition-colors duration-300",
        state === "completed" ? "bg-[#16A34A]" : "bg-[#E2E8F0] dark:bg-slate-700",
        className
      )}
      {...props}
    />
  );
}

// ── StepperPanel ──────────────────────────────────────────────────────────────

interface StepperPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function StepperPanel({ children, className, ...props }: StepperPanelProps) {
  return (
    <div data-slot="stepper-panel" className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

// ── StepperContent ────────────────────────────────────────────────────────────

interface StepperContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  children: React.ReactNode;
}

function StepperContent({ value, children, className, ...props }: StepperContentProps) {
  const { value: current } = React.useContext(StepperContext);
  const isActive = current === value;

  return (
    <div
      data-slot="stepper-content"
      data-state={isActive ? "active" : "inactive"}
      className={cn(!isActive && "hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Badge (inline mini-badge for step state) ───────────────────────────────────

interface StepperBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary-light" | "success-light" | "secondary";
  size?: "sm";
  children: React.ReactNode;
}

function StepperBadge({ variant = "secondary", children, className, ...props }: StepperBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
        variant === "primary-light" && "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1D4ED8]/20 dark:text-[#93C5FD]",
        variant === "success-light" && "bg-[#F0FDF4] text-[#16A34A] dark:bg-[#166534]/20 dark:text-[#86EFAC]",
        variant === "secondary" && "bg-[#F1F5F9] text-[#64748B] dark:bg-slate-800 dark:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
  StepperPanel,
  StepperContent,
  StepperBadge,
};
