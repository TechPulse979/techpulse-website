"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appName, setAppName] = useState("TechPulse");
  const [appLogoText, setAppLogoText] = useState("T");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.appName) setAppName(data.appName);
          if (data.appLogoText) setAppLogoText(data.appLogoText);
        }
      })
      .catch(err => console.error("Error fetching settings in admin layout:", err));
  }, []);

  if (pathname === "/admin/login") return <>{children}</>;

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Write Blog", href: "/admin/write", icon: <PenTool size={20} /> },
    { name: "Manage Blogs", href: "/admin/manage", icon: <FileText size={20} /> },
    { name: "Users", href: "/admin/users", icon: <Users size={20} /> },
    { name: "Messages", href: "/admin/messages", icon: <MessageSquare size={20} /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all ${
              isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-secondary hover:bg-light dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {item.name}
            </div>
            {isActive && <ChevronRight size={16} />}
          </Link>
        );
      })}
    </>
  );

  const UserFooter = () => (
    <div className="p-6 border-t border-border">
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
          {session?.user?.name?.[0]}
        </div>
        <div className="overflow-hidden">
          <p className="font-black text-sm truncate uppercase tracking-tighter">{session?.user?.name}</p>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Administrator</p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-500/10 rounded-2xl font-bold transition-all"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-light dark:bg-[#020617] flex">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white dark:bg-dark border-r border-border hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl uppercase">{appLogoText}</div>
            <span className="font-black text-xl tracking-tighter uppercase">{appName}</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLinks />
        </nav>
        <UserFooter />
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-dark/90 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black uppercase">{appLogoText}</div>
          <span className="font-black text-lg tracking-tighter uppercase">{appName}</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 bg-light dark:bg-white/5 rounded-xl border border-border"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-[70] w-72 max-w-[85vw] bg-white dark:bg-dark border-r border-border flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <span className="font-black text-xl tracking-tighter uppercase">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-light dark:hover:bg-white/5" aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </nav>
              <UserFooter />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 px-5 pt-24 pb-12 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
