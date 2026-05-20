'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { SignOutButton } from './sign-out-button';

const TITLES: Array<[RegExp, string]> = [
  [/^\/admin$/, 'Dashboard'],
  [/^\/admin\/posts/, 'Posts'],
  [/^\/admin\/products/, 'Products'],
  [/^\/admin\/orders/, 'Orders'],
  [/^\/admin\/subscribers/, 'Subscribers'],
  [/^\/admin\/profile/, 'My profile'],
  [/^\/admin\/team/, 'Team'],
  [/^\/admin\/settings/, 'Settings'],
];

function getTitle(pathname: string): string {
  for (const [pattern, title] of TITLES) {
    if (pattern.test(pathname)) return title;
  }
  return 'Admin';
}

export function Topbar({
  user,
  onOpenMenu,
}: {
  user: { name: string; email: string };
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="-ml-1 rounded-md p-1.5 text-fg-muted hover:bg-bg hover:text-fg md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold tracking-tight text-fg sm:text-lg">
          {getTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <Link
          href="/admin/profile"
          className="hidden items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-bg sm:flex"
          title="My profile"
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
            <User size={16} />
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-fg">{user.name}</p>
            <p className="text-xs text-fg-muted">{user.email}</p>
          </div>
        </Link>

        <SignOutButton />
      </div>
    </header>
  );
}
