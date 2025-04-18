import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

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
})

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
