import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { baseUrl } from "@/lib/metadata"

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope',
  display: "swap",
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | Miru",
    default: "Miru",
  },
  description: "A free, open-source, and fully customisable status page and monitoring service.",
  metadataBase: baseUrl,
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
