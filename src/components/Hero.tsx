"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal, Cpu, Globe } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden bg-light dark:bg-dark">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-border rounded-full mb-8 shadow-sm"
          >
            <Sparkles size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">The Future of Tech is Here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-balance"
          >
            Decoding the{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Digital Pulse
            </span>{" "}
            <br />
            of Tomorrow.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-secondary font-medium mb-12 leading-relaxed"
          >
            Explore deep dives into AI, Software Architecture, and the rapidly evolving tech landscape.
            Crafted for developers, by enthusiasts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Link
              href="/blog"
              className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20 flex items-center gap-4"
            >
              Start Reading <ArrowRight size={20} />
            </Link>
            <Link
              href="/about"
              className="px-10 py-5 bg-white dark:bg-white/5 border border-border text-dark dark:text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-light dark:hover:bg-white/10 transition-all"
            >
              Our Mission
            </Link>
          </motion.div>

          {/* Quick stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-14"
          >
            {[
              { value: "500+", label: "Articles" },
              { value: "50K+", label: "Readers" },
              { value: "12", label: "Categories" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black tracking-tight text-dark dark:text-white">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Floating Stats/Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full"
          >
            {[
              { icon: <Terminal />, title: "Code Excellence", desc: "Best practices & patterns" },
              { icon: <Cpu />, title: "AI Revolution", desc: "Machine learning insights" },
              { icon: <Globe />, title: "Global Impact", desc: "Tech trends worldwide" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="p-8 bg-white/50 dark:bg-white/5 border border-border rounded-[2rem] backdrop-blur-sm flex flex-col items-center text-center group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="font-black text-lg mb-2 uppercase tracking-tighter">{feature.title}</h3>
                <p className="text-secondary text-sm font-bold uppercase tracking-widest">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
