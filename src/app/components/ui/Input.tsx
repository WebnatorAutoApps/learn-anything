import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

const INPUT_CLASSES =
  "rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-theme-primary placeholder-theme-primary-faint focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary transition-colors text-sm";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`${INPUT_CLASSES} ${className}`}
        {...rest}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`${INPUT_CLASSES} resize-none ${className}`}
        {...rest}
      />
    );
  }
);
