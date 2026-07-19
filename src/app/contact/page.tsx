"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone, Send, Twitter, Github, Linkedin, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error fetching settings in ContactPage:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setIsSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 bg-light dark:bg-dark min-h-screen">
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="max-w-4xl mb-24">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6 block">Connect</span>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter text-balance">Get in <span className="text-primary italic">touch.</span></h1>
            <p className="text-secondary text-2xl font-medium leading-relaxed max-w-2xl">
              Have a visionary project in mind? We're here to turn your tech pulse into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Contact Form */}
            <div className="bg-white dark:bg-dark/50 p-10 md:p-20 rounded-[4rem] border border-border shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
               
              {isSent ? (
                <div className="text-center py-20 animate-in fade-in zoom-in relative z-10">
                  <div className="inline-flex items-center justify-center p-6 bg-primary/10 text-primary rounded-full mb-8">
                    <CheckCircle2 size={64} />
                  </div>
                  <h2 className="text-4xl font-black mb-4 tracking-tight">Mission Received!</h2>
                  <p className="text-secondary text-xl mb-12">
                    We'll pulse back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="bg-dark dark:bg-white text-white dark:text-dark px-10 py-5 rounded-2xl font-bold shadow-lg hover:scale-[1.05] transition-all"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label htmlFor="name" className="text-xs font-black uppercase tracking-widest ml-1 text-secondary">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Pulse Engineer"
                        className="w-full px-8 py-5 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all shadow-inner placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="email" className="text-xs font-black uppercase tracking-widest ml-1 text-secondary">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="hello@world.io"
                        className="w-full px-8 py-5 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all shadow-inner placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="subject" className="text-xs font-black uppercase tracking-widest ml-1 text-secondary">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Project Inquiry"
                      className="w-full px-8 py-5 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all shadow-inner placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="message" className="text-xs font-black uppercase tracking-widest ml-1 text-secondary">Your Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your next big thing..."
                      className="w-full px-8 py-5 bg-light dark:bg-dark border border-border rounded-[2rem] focus:outline-none focus:border-primary font-bold transition-all resize-none shadow-inner placeholder:text-gray-300"
                    ></textarea>
                  </div>
                  {error && (
                    <p className="text-red-500 font-bold text-sm text-center">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-purple-600 disabled:opacity-70 text-white font-black uppercase tracking-widest py-6 px-10 rounded-[2rem] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center shadow-xl shadow-primary/30"
                  >
                    {isSubmitting ? (
                      <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send size={20} className="mr-3" />
                        Transmit Pulse
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:py-10">
              <div className="space-y-16">
                <div className="flex items-start space-x-8 group">
                  <div className="p-5 bg-white dark:bg-dark/50 border border-border text-primary rounded-[1.5rem] shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Mail size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Direct Channel</h3>
                    <p className="text-secondary font-bold mb-3">Reach out via secure mail.</p>
                    <a href="mailto:hello@mindrovia.com" className="text-2xl font-black text-primary hover:underline">hello@mindrovia.com</a>
                  </div>
                </div>

                <div className="flex items-start space-x-8 group">
                  <div className="p-5 bg-white dark:bg-dark/50 border border-border text-primary rounded-[1.5rem] shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Global HQ</h3>
                    <p className="text-secondary font-bold mb-3">Visit our innovation hub.</p>
                    <p className="text-2xl font-black">San Francisco, CA 94107</p>
                  </div>
                </div>

                <div className="flex items-start space-x-8 group">
                  <div className="p-5 bg-white dark:bg-dark/50 border border-border text-primary rounded-[1.5rem] shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Phone size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Vocal Pulse</h3>
                    <p className="text-secondary font-bold mb-3">Available for urgent signals.</p>
                    <a href="tel:+1555000000" className="text-2xl font-black text-primary hover:underline">+1 (555) 000-0000</a>
                  </div>
                </div>
              </div>

              <div className="mt-24 pt-12 border-t border-border">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] mb-10 text-secondary">Signal Channels</h4>
                <div className="flex gap-4">
                  {[Twitter, Github, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="p-6 bg-white dark:bg-dark/50 border border-border rounded-[2rem] hover:bg-primary hover:text-white transition-all group shadow-md hover:shadow-primary/20 hover:scale-110">
                      <Icon size={28} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Map Component */}
        <section className="px-6 mb-32">
          <div className="max-w-7xl mx-auto h-[600px] rounded-[4rem] overflow-hidden grayscale brightness-75 relative group shadow-2xl border-4 border-white dark:border-gray-800">
             <Image 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop" 
              alt="Globe Map" 
              fill 
              className="object-cover transition-transform duration-[2s] group-hover:scale-110"
             />
             <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="p-10 bg-white/90 dark:bg-dark/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_0_50px_rgba(124,58,237,0.3)] flex items-center space-x-6 animate-bounce border-2 border-primary/20">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <MapPin size={40} />
                  </div>
                  <div>
                    <span className="font-black text-2xl block tracking-tighter">{settings?.appName ? `${settings.appName.toUpperCase()} STUDIO` : "MIND ROVIA STUDIO"}</span>
                    <span className="text-primary font-bold text-sm tracking-widest uppercase">Signal Center</span>
                  </div>
                </div>
                {/* Radial Glow */}
                <div className="absolute w-[400px] h-[400px] border border-primary/50 rounded-full animate-ping opacity-20" />
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
