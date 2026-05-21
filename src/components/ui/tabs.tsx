"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used inside Tabs.");
  }

  return context;
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = value ?? internalValue;

  function setValue(nextValue: string) {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={cn("w-full", className)} {...props} />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-9 items-center rounded-lg bg-[#202020] p-1 text-[#a1a1aa]",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
}) {
  const tabs = useTabs();
  const isActive = tabs.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => tabs.setValue(value)}
      className={cn(
        "inline-flex h-7 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[#3b82f6]/40",
        isActive
          ? "bg-[#0a0a0a] text-[#fafafa] shadow-sm"
          : "text-[#a1a1aa] hover:text-[#fafafa]",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string;
}) {
  const tabs = useTabs();

  if (tabs.value !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn("mt-4 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
