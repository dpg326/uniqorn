import './globals.css';

import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Uniqorn',
  description: 'Weighted uniqueness of NBA statlines'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-50">
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          {/* Navbar */}
          <nav className="border-b border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="text-3xl font-black tracking-wider text-sky-300">
                  UNIQORN
                </Link>
                <div className="flex space-x-6">
                  <Link href="/" className="text-sky-200 hover:text-sky-100 transition-colors">
                    Home
                  </Link>
                  <Link href="/scoreboard" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Scoreboard
                  </Link>
                  <Link href="/ultimate" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Ultimate
                  </Link>
                  <Link href="/career" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Career
                  </Link>
                  <Link href="/historical" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Historical
                  </Link>
                  <Link href="/search" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Search
                  </Link>
                  <Link href="/visualizations" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Visualizations
                  </Link>
                  <Link href="/about" className="text-sky-300 hover:text-sky-200 transition-colors">
                    About
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
