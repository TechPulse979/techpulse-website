"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone as PhoneIcon,
  Loader2,
  Save,
  CheckCircle,
  Upload,
  ExternalLink,
  Mail,
  MapPin,
} from "lucide-react";
import { defaultContact, mergeContact, type ContactContent } from "@/lib/pageDefaults";

const inputClass =
  "w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all";
const textareaClass =
  "w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-all resize-none min-h-[90px]";
const labelClass =
  "text-secondary font-bold uppercase tracking-widest text-[10px] mb-2 block";

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactContent>(defaultContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setContact(mergeContact(data.contact));
      })
      .catch((err) => console.error("Failed to load Contact settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof ContactContent>(key: K, value: ContactContent[K]) =>
    setContact((prev) => ({ ...prev, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (res.ok) set("mapImage", result.url);
      else setMessage({ type: "error", text: result.error || "Upload failed" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload image" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Contact page saved! Changes are live." });
        setContact(mergeContact(data.contact));
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-primary">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-black text-xs uppercase tracking-widest animate-pulse">Loading Contact Content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
            <PhoneIcon className="text-primary" /> Contact Page
          </h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">
            Edit the hero, contact details, socials and map
          </p>
        </div>
        <Link
          href="/contact"
          target="_blank"
          className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
        >
          <ExternalLink size={14} /> View Live Page
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Hero Section</h2>
          <div>
            <label className={labelClass}>Hero Label (small caps)</label>
            <input className={inputClass} value={contact.heroLabel} onChange={(e) => set("heroLabel", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Heading Prefix</label>
              <input className={inputClass} value={contact.headingPrefix} onChange={(e) => set("headingPrefix", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Heading Highlight (italic purple)</label>
              <input className={inputClass} value={contact.headingHighlight} onChange={(e) => set("headingHighlight", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea className={textareaClass} value={contact.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </div>
        </section>

        {/* Contact details */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Contact Details</h2>

          <div className="space-y-3 border border-border rounded-2xl p-5">
            <p className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-secondary"><Mail size={14} className="text-primary" /> Email Card</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Card Title</label>
                <input className={inputClass} value={contact.emailLabel} onChange={(e) => set("emailLabel", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input className={inputClass} value={contact.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <input className={inputClass} value={contact.emailDescription} onChange={(e) => set("emailDescription", e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 border border-border rounded-2xl p-5">
            <p className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-secondary"><MapPin size={14} className="text-primary" /> Address Card</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Card Title</label>
                <input className={inputClass} value={contact.addressLabel} onChange={(e) => set("addressLabel", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input className={inputClass} value={contact.address} onChange={(e) => set("address", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <input className={inputClass} value={contact.addressDescription} onChange={(e) => set("addressDescription", e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 border border-border rounded-2xl p-5">
            <p className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-secondary"><PhoneIcon size={14} className="text-primary" /> Phone Card</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Card Title</label>
                <input className={inputClass} value={contact.phoneLabel} onChange={(e) => set("phoneLabel", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input className={inputClass} value={contact.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <input className={inputClass} value={contact.phoneDescription} onChange={(e) => set("phoneDescription", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Socials */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Social Channels</h2>
          <div>
            <label className={labelClass}>Section Title</label>
            <input className={inputClass} value={contact.socialsTitle} onChange={(e) => set("socialsTitle", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Twitter URL</label>
              <input className={inputClass} value={contact.twitterUrl} onChange={(e) => set("twitterUrl", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>GitHub URL</label>
              <input className={inputClass} value={contact.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input className={inputClass} value={contact.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Map / studio */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Map Banner</h2>
          <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={contact.mapImage} alt="Map banner" className="w-full h-full object-cover" />
          </div>
          <div>
            <label className={labelClass}>Map Image URL</label>
            <div className="flex gap-3">
              <input className={inputClass} value={contact.mapImage} onChange={(e) => set("mapImage", e.target.value)} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} Upload
              </button>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Studio Name (on map)</label>
              <input className={inputClass} value={contact.studioName} onChange={(e) => set("studioName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Studio Tagline</label>
              <input className={inputClass} value={contact.studioTagline} onChange={(e) => set("studioTagline", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex flex-col gap-4 sticky bottom-4">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              <CheckCircle size={16} /> <span>{message.text}</span>
            </motion.div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/95 text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Save size={16} /> Save Contact Page</>}
          </button>
        </div>
      </form>
    </div>
  );
}
