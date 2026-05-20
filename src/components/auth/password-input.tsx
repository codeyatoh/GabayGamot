"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function PasswordInput({
  id = "password",
  name = "password",
  className,
  placeholder = "Password",
  required = true,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        className={className}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
