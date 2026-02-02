import { type ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  maxWidth?: string;
  title?: string;
  children: ReactNode;
}

export default function Modal({
  onClose,
  maxWidth = "max-w-md",
  title,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidth} mx-4 rounded-lg border border-theme-border bg-theme-surface p-6 shadow-lg shadow-[color:var(--t-glow)]`}
      >
        {title && (
          <h3 className="text-lg font-semibold text-theme-primary mb-2">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}
