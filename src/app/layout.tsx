import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ranmuthu Fancy — Premium Quality Products",
    template: "%s | Ranmuthu Fancy",
  },
  description:
    "Discover premium products at Ranmuthu Fancy. Quality electronics, fashion, home & living delivered across Sri Lanka.",
  keywords: ["online store", "sri lanka", "shop", "ecommerce", "ranmuthu fancy", "premium products"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Ranmuthu Fancy — Premium Quality Products",
    description: "Quality products, beautifully curated. Shop now.",
    type: "website",
    locale: "en_LK",
    siteName: "Ranmuthu Fancy",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rf-theme');if(t==='light'||t==='dark'){document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
