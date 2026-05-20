import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Healthy with Diet — Food Science, Nutrition & Education",
    template: "%s | Healthy with Diet",
  },
  description:
    "Educational articles, recipes, and digital resources from a food scientist and nutrition educator.",
  applicationName: "Healthy with Diet",
  authors: [{ name: "Joy" }],
  keywords: [
    "food science",
    "nutrition",
    "Nigerian recipes",
    "catering business",
    "ebooks",
    "food education",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Healthy with Diet",
    title: "Healthy with Diet — Food Science, Nutrition & Education",
    description:
      "Recipes, nutrition guides, and business ebooks from a working food scientist.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healthy with Diet — Food Science, Nutrition & Education",
    description:
      "Recipes, nutrition guides, and business ebooks from a working food scientist.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
