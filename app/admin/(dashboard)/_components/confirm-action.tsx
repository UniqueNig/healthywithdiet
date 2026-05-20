'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  children: React.ReactNode;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  triggerTitle?: string;
};

export function ConfirmAction({
  action,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  children,
  triggerClassName,
  triggerAriaLabel,
  triggerTitle,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    confirmButtonRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={triggerAriaLabel}
        title={triggerTitle}
        className={triggerClassName}
      >
        {children}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="fixed inset-0 z-[100] grid place-items-center px-4 py-8"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="anim-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <div
              className="anim-modal-in relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
              style={{
                animation: 'modal-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
              }}
            >
              <div className="flex items-start gap-4 p-6">
                <div
                  className={
                    destructive
                      ? 'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-100 text-red-600'
                      : 'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary'
                  }
                >
                  <AlertTriangle size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      id="confirm-title"
                      className="font-serif text-xl font-medium text-fg"
                    >
                      {title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close"
                      className="-mr-1 -mt-1 rounded-md p-1.5 text-fg-muted hover:bg-bg hover:text-fg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {description && (
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <form
                action={action}
                className="flex flex-col-reverse gap-3 border-t border-border bg-bg-alt px-6 py-4 sm:flex-row sm:justify-end"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-bg"
                >
                  {cancelLabel}
                </button>
                <button
                  ref={confirmButtonRef}
                  type="submit"
                  className={
                    destructive
                      ? 'inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-red-700'
                      : 'inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wider text-primary-fg transition hover:bg-primary-deep'
                  }
                >
                  {confirmLabel}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
