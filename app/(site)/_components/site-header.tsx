'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-bg/95">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <Leaf
              className="text-primary transition-transform duration-500 group-hover:rotate-12"
              size={22}
              strokeWidth={2.2}
            />
            <span className="font-serif text-lg tracking-tight text-fg">
              Healthy with Diet
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-fg-muted hover:text-fg',
                ].join(' ')}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="-mr-1 rounded-md p-2 text-fg-muted hover:bg-surface hover:text-fg md:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100] md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="anim-fade-in absolute inset-0 bg-black/70"
            />
            <div className="anim-slide-in-right absolute inset-y-0 right-0 flex h-full w-[88%] max-w-xs flex-col bg-surface shadow-2xl">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
                <div className="flex items-center gap-2">
                  <Leaf className="text-primary" size={20} strokeWidth={2.2} />
                  <span className="font-serif text-base tracking-tight text-fg">
                    Healthy with Diet
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-md p-1.5 text-fg-muted hover:bg-bg hover:text-fg"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-5">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-fg hover:bg-bg',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="shrink-0 border-t border-border p-5">
                <p className="font-serif text-sm italic text-fg-muted">
                  Food science · Nutrition · Education
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
