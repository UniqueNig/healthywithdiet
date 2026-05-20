import { SiteHeader } from './_components/site-header';
import { SiteFooter } from './_components/site-footer';
import { BackToTop } from './_components/back-to-top';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
