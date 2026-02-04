'use client';

import './globals.css';

import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { useState } from 'react';

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-50">
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          {/* Navbar */}
          <nav className="border-b border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="text-2xl md:text-3xl font-black tracking-wider text-sky-300">
                  UNIQORN
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden lg:flex space-x-6">
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

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-sky-300 hover:text-sky-200"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation */}
              {mobileMenuOpen && (
                <div className="lg:hidden py-4 space-y-2">
                  <Link href="/" className="block py-2 text-sky-200 hover:text-sky-100 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </Link>
                  <Link href="/scoreboard" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Scoreboard
                  </Link>
                  <Link href="/ultimate" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Ultimate
                  </Link>
                  <Link href="/career" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Career
                  </Link>
                  <Link href="/historical" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Historical
                  </Link>
                  <Link href="/search" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Search
                  </Link>
                  <Link href="/visualizations" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Visualizations
                  </Link>
                  <Link href="/about" className="block py-2 text-sky-300 hover:text-sky-200 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    About
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <main className="container mx-auto px-4 py-4 md:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
