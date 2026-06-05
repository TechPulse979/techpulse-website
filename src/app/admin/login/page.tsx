"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-6 pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-dark/50 border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Lock size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h1>
              <p className="text-secondary font-medium uppercase text-xs tracking-widest">Authentication Required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-secondary ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-light dark:bg-dark/50 border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all"
                    placeholder="admin@techpulse.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-secondary ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-light dark:bg-dark/50 border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-500/20 text-center">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Access Dashboard"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
          
          <p className="text-center mt-8 text-secondary text-sm font-medium">
            Forgot credentials? Contact system administrator.
          </p>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
