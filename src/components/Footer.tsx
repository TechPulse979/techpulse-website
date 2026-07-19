"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin, Mail, Zap, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer({ settings: initialSettings }: { settings?: any }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
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
        .catch((err) => console.error("Error fetching settings in Footer:", err));
    }
  }, [initialSettings]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed successfully!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <footer className="bg-dark text-white pt-32 pb-16 px-6 overflow-hidden relative">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center mb-20">
          {/* Brand & Newsletter Column */}
          <div className="bg-[#1E293B] backdrop-blur-xl border border-white/5 p-10 md:p-14 rounded-[2.5rem] shadow-2xl shadow-black/40">
            <h2 className="text-3xl font-black mb-4 leading-tight tracking-tight">
              {settings?.newsletterTitle || "Subscribe to our newsletter"}
            </h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium">
              {settings?.newsletterSubtitle || "Get weekly updates on the latest tech trends and exclusive insights delivered to your inbox."}
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="email"
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-500 font-medium disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-primary hover:bg-purple-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-xl flex items-center justify-center transition-all cursor-pointer min-w-[160px]"
              >
                {status === "loading" ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Subscribe Now"
                )}
              </button>
            </form>

            {status !== "idle" && message && (
              <div className={`mt-4 p-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                status === "success" 
                  ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {status === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{message}</span>
              </div>
            )}
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              NO SPAM, JUST QUALITY INSIGHTS. UNSUBSCRIBE ANYTIME.
            </p>
          </div>

          {/* Links and Contact Column */}
          <div className="lg:pl-10">
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 font-black text-lg uppercase">
                {settings?.appLogoText || "MR"}
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                {settings?.appName || "MIND ROVIA"}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-12 leading-relaxed font-medium max-w-sm">
              {settings?.footerAbout || "Explore a world of knowledge where innovation meets inspiration. From technology and entrepreneurship to wellness, travel, finance, and everyday living, Mindrovia brings you content that truly matters."}
            </p>
            
            <div className="flex space-x-4 mb-10">
              <a href={settings?.twitterUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href={settings?.githubUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300">
                <Github size={18} />
              </a>
              <a href={settings?.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
 
        <div className="flex flex-col md:row justify-between items-center py-10 border-t border-white/5 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
           <p>© {new Date().getFullYear()} {settings?.appName || "MIND ROVIA"} Studio. All Rights Reserved.</p>
           <div className="flex space-x-8 mt-6 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
