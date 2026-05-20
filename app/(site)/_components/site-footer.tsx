import Link from 'next/link';
import { Leaf, Mail } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from './brand-icons';
import { NewsletterForm } from './newsletter-form';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <Leaf className="text-primary" size={22} strokeWidth={2.2} />
            <span className="font-serif text-xl tracking-tight text-fg">
              Healthy with Diet
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-fg-muted">
            Food science, nutrition, and education for kitchens and food
            businesses across Nigeria and beyond.
          </p>
          <div className="mt-5 flex items-center gap-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-md p-2 text-fg-muted transition-colors hover:bg-bg hover:text-primary"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="rounded-md p-2 text-fg-muted transition-colors hover:bg-bg hover:text-primary"
            >
              <YoutubeIcon size={18} />
            </a>
            <Link
              href="/contact"
              aria-label="Email"
              className="rounded-md p-2 text-fg-muted transition-colors hover:bg-bg hover:text-primary"
            >
              <Mail size={18} />
            </Link>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Explore
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <FooterLink href="/shop">Shop</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/lost-download">Lost a download?</FooterLink>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Join the list
          </h4>
          <p className="mt-3 text-sm text-fg-muted">
            New recipes, nutrition tips, and product drops. No spam.
          </p>
          <div className="mt-4">
            <NewsletterForm variant="light" />
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Healthy with Diet. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Made in Nigeria</span>
            <span aria-hidden className="text-fg-muted/50">·</span>
            <span>
              Developed by{' '}
              <a
                href="https://emmanuelfaniyi.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-fg transition-colors hover:text-primary"
              >
                <span aria-hidden>🌱</span> Tech with Dami
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-fg-muted transition-colors hover:text-primary"
      >
        {children}
      </Link>
    </li>
  );
}
