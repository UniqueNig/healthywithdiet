'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingBag,
  Mail,
  Settings,
  Leaf,
  User,
  Users,
} from 'lucide-react';

const PRIMARY_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const ACCOUNT_NAV = [
  { href: '/admin/profile', label: 'My profile', icon: User },
  { href: '/admin/team', label: 'Team', icon: Users },
];

export function Sidebar({
  onNavigate,
  tagline,
}: {
  onNavigate?: () => void;
  tagline?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2"
        >
          <Leaf className="text-primary" size={22} strokeWidth={2.2} />
          <span className="font-semibold tracking-tight text-fg">
            Healthy with Diet
          </span>
        </Link>
        <p className="mt-1 text-xs italic text-fg-muted">
          {tagline ?? 'Food science · Nutrition'}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}

        <div className="my-3 px-3">
          <div className="h-px bg-border" />
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
            Account
          </p>
        </div>

        {ACCOUNT_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-border px-6 py-4 text-xs text-fg-muted">
        v0.1 · Built with care
      </div>
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  exact?: boolean;
};

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={[
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-fg hover:bg-bg hover:text-primary',
      ].join(' ')}
    >
      <Icon
        size={18}
        strokeWidth={isActive ? 2.2 : 1.8}
        className={isActive ? 'text-primary' : 'text-fg-muted group-hover:text-primary'}
      />
      {item.label}
    </Link>
  );
}
