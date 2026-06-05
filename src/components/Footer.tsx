import Link from "next/link";
import { Twitter, Github, Linkedin, Mail, Zap, ArrowRight } from "lucide-react";

export default function Footer() {
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
              Subscribe to our newsletter
            </h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium">
              Get weekly updates on the latest tech trends and exclusive<br className="hidden md:block" /> insights delivered to your inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="email"
                placeholder="youremail@example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-500 font-medium"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-purple-600 text-white font-black text-xs uppercase tracking-widest py-4 px-8 rounded-xl flex items-center justify-center transition-all"
              >
                Subscribe Now
              </button>
            </form>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              NO SPAM, JUST QUALITY INSIGHTS. UNSUBSCRIBE ANYTIME.
            </p>
          </div>

          {/* Links and Contact Column */}
          <div className="lg:pl-10">
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Zap size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                TechPulse
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-12 leading-relaxed font-medium max-w-sm">
              Staying ahead in the fast-paced world of technology. We deliver high-quality, research-driven content for engineers and tech enthusiasts.
            </p>
            
            <div className="flex space-x-4 mb-10">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:row justify-between items-center py-10 border-t border-white/5 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
           <p>© 2026 TechPulse Studio. All Rights Reserved.</p>
           <div className="flex space-x-8 mt-6 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
