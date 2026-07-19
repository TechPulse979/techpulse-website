"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu, X, Zap, Sun, Moon, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar({ settings: initialSettings }: { settings?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    } else {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSettings(data);
          }
        })
        .catch((err) => console.error("Error fetching settings in Navbar:", err));
    }
  }, [initialSettings]);

  const appName = settings?.appName || "MIND ROVIA";
  const appLogoText = settings?.appLogoText || "MR";

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "bg-white/80 dark:bg-dark/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 font-black text-lg uppercase">
            {appLogoText}
          </div>
          <span className="text-2xl font-bold tracking-tight">
            {appName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-secondary hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-accent/50 hover:bg-accent dark:bg-white/5 dark:hover:bg-white/10 text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-white rounded-full transition-all flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search insights..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="pl-11 pr-6 py-2.5 bg-accent/50 dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white rounded-full text-sm font-medium focus:outline-none transition-all w-48 focus:w-64 dark:text-white"
            />

            {/* Live Autocomplete Dropdown */}
            {searchFocused && searchQuery.trim() !== "" && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-dark border border-border dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-primary">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-2 border-b border-border dark:border-slate-800 text-[8px] font-black uppercase tracking-widest text-secondary">
                      Suggested Stories
                    </div>
                    {searchResults.map((post) => (
                      <Link
                        key={post._id}
                        href={`/blog/${post.slug}`}
                        className="flex flex-col px-4 py-3 hover:bg-light dark:hover:bg-white/5 transition-colors border-b border-border/50 dark:border-slate-800/50 last:border-0"
                      >
                        <span className="font-extrabold text-xs text-dark dark:text-white line-clamp-1 hover:text-primary transition-colors">
                          {post.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[8px] font-bold text-secondary uppercase tracking-widest">
                          <span className="text-primary">{post.category}</span>
                          <span>&bull;</span>
                          <span>{post.readTime}</span>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest text-secondary">
                    No insights match your search
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 bg-accent/50 dark:bg-white/5 text-secondary dark:text-gray-400 rounded-md transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-accent rounded-md transition-colors text-secondary dark:text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-dark border-t border-border shadow-lg py-6 px-6 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search insights..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-6 py-3 bg-accent/50 dark:bg-white/5 dark:text-white rounded-xl text-sm font-medium focus:outline-none"
              />
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
