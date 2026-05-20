import Link from 'next/link';
import { FileText, Package, ShoppingBag, Mail, ArrowRight } from 'lucide-react';

const CARDS = [
  {
    href: '/admin/posts',
    title: 'Blog posts',
    description: 'Write articles, recipes, and tips for your audience.',
    icon: FileText,
  },
  {
    href: '/admin/products',
    title: 'Products',
    description: 'Upload ebooks, set prices, publish to the shop.',
    icon: Package,
  },
  {
    href: '/admin/orders',
    title: 'Orders',
    description: 'See who bought what and resend download links.',
    icon: ShoppingBag,
  },
  {
    href: '/admin/subscribers',
    title: 'Subscribers',
    description: 'Manage your newsletter list and exports.',
    icon: Mail,
  },
];

export default function DashboardHome() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-fg-muted">
          Today
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-fg">
          Welcome back.
        </h2>
        <p className="mt-2 max-w-xl text-fg-muted">
          Pick where to start. Everything here is yours to edit — no code, no
          permission slips.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition hover:border-primary"
            >
              <div className="flex items-start justify-between">
                <div className="pr-4">
                  <h3 className="font-semibold text-fg">{card.title}</h3>
                  <p className="mt-1 text-sm text-fg-muted">
                    {card.description}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition group-hover:bg-primary group-hover:text-primary-fg">
                  <Icon size={18} />
                </div>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Open
                <ArrowRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
