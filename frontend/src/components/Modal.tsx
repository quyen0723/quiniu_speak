import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

// Generic modal shell — same overlay/panel/focus pattern as TokenPrompt:
// click-outside (onClose) closes, click inside the panel is stopped, and the
// first focusable element inside is focused on open (30ms delay for paint).
export default function Modal({ open, title, subtitle, onClose, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('input,textarea,button')?.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
        {subtitle && <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
        {children}
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}