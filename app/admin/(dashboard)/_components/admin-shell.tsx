'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AdminShell({
  user,
  tagline,
  children,
}: {
  user: { name: string; email: string };
  tagline?: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <Sidebar tagline={tagline} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-surface shadow-lg">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-fg-muted hover:bg-bg hover:text-fg"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar
              tagline={tagline}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <Topbar user={user} onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
