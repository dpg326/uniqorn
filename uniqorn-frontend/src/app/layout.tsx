'use client';

import './globals.css';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/player-search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
      }
    };
    
    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/player/${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectPlayer = (name: string) => {
    router.push(`/player/${encodeURIComponent(name)}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

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
                <div className="hidden lg:flex items-center space-x-6">
                  <Link href="/" className="text-sky-200 hover:text-sky-100 transition-colors">
                    Home
                  </Link>
                  <Link href="/scoreboard" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Scoreboard
                  </Link>
                  <Link href="/historical" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Historical
                  </Link>
                  <Link href="/search" className="text-sky-300 hover:text-sky-200 transition-colors">
                    Bucket Search
                  </Link>
                  
                  {/* More Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      className="flex items-center gap-1 text-sky-300 hover:text-sky-200 transition-colors"
                    >
                      More
                      <svg className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {moreMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-800 border border-sky-400/30 rounded-lg shadow-xl z-[9999]">
                        <Link href="/ultimate" className="block px-4 py-2 text-sm text-zinc-100 hover:bg-sky-400/20 transition-colors rounded-t-lg" onClick={() => setMoreMenuOpen(false)}>
                          Ultimate
                        </Link>
                        <Link href="/career" className="block px-4 py-2 text-sm text-zinc-100 hover:bg-sky-400/20 transition-colors" onClick={() => setMoreMenuOpen(false)}>
                          Career
                        </Link>
                        <Link href="/visualizations" className="block px-4 py-2 text-sm text-zinc-100 hover:bg-sky-400/20 transition-colors" onClick={() => setMoreMenuOpen(false)}>
                          Visualizations
                        </Link>
                        <Link href="/about" className="block px-4 py-2 text-sm text-zinc-100 hover:bg-sky-400/20 transition-colors rounded-b-lg" onClick={() => setMoreMenuOpen(false)}>
                          About
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Player Search */}
                  <div className="relative flex items-center">
                    {searchOpen ? (
                      <div className="relative">
                        <form onSubmit={handleSearch} className="flex items-center">
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Player name..."
                            className="w-48 px-3 py-1 rounded-lg bg-zinc-800 border border-sky-400/30 text-zinc-100 text-sm placeholder-zinc-400 focus:outline-none focus:border-sky-400"
                            onFocus={() => setShowSuggestions(true)}
                          />
                          <button
                            type="button"
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSuggestions([]); }}
                            className="ml-2 text-zinc-400 hover:text-zinc-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </form>
                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-800 border border-sky-400/30 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                            {suggestions.map((name, i) => (
                              <button
                                key={i}
                                onClick={() => selectPlayer(name)}
                                className="w-full px-3 py-2 text-left text-sm text-zinc-100 hover:bg-sky-400/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSearchOpen(true)}
                        className="text-sky-300 hover:text-sky-200 transition-colors p-1"
                        aria-label="Search players"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
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
                  {/* Mobile Player Search */}
                  <div className="pb-3 mb-3 border-b border-zinc-700/50">
                    <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search player..."
                          className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-sky-400/30 text-zinc-100 text-sm placeholder-zinc-400 focus:outline-none focus:border-sky-400"
                          onFocus={() => setShowSuggestions(true)}
                        />
                      </div>
                    </form>
                    {/* Mobile Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="mt-2 bg-zinc-800 border border-sky-400/30 rounded-lg shadow-xl z-[9999] max-h-48 overflow-y-auto relative">
                        {suggestions.map((name, i) => (
                          <button
                            key={i}
                            onClick={() => selectPlayer(name)}
                            className="w-full px-3 py-2 text-left text-sm text-zinc-100 hover:bg-sky-400/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
