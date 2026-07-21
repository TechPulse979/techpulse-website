"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserCircle,
  Loader2,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
} from "lucide-react";
import { defaultAbout, mergeAbout, type AboutContent } from "@/lib/pageDefaults";

const inputClass =
  "w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all";
const textareaClass =
  "w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-all resize-none min-h-[100px]";
const labelClass =
  "text-secondary font-bold uppercase tracking-widest text-[10px] mb-2 block";

export default function AdminAboutPage() {
  const [about, setAbout] = useState<AboutContent>(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setAbout(mergeAbout(data.about));
      })
      .catch((err) => console.error("Failed to load About settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setAbout((prev) => ({ ...prev, [key]: value }));

  // ── Stats ──────────────────────────────────────────────
  const updateStat = (i: number, field: "label" | "value", value: string) =>
    setAbout((prev) => ({
      ...prev,
      stats: prev.stats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }));
  const addStat = () => setAbout((prev) => ({ ...prev, stats: [...prev.stats, { label: "", value: "" }] }));
  const removeStat = (i: number) =>
    setAbout((prev) => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }));

  // ── Skills ─────────────────────────────────────────────
  const updateSkill = (i: number, value: string) =>
    setAbout((prev) => ({ ...prev, skills: prev.skills.map((s, idx) => (idx === i ? value : s)) }));
  const addSkill = () => setAbout((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  const removeSkill = (i: number) =>
    setAbout((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));

  // ── Skill bars ─────────────────────────────────────────
  const updateBar = (i: number, field: "label" | "percent", value: string) =>
    setAbout((prev) => ({
      ...prev,
      skillBars: prev.skillBars.map((b, idx) =>
        idx === i ? { ...b, [field]: field === "percent" ? Math.max(0, Math.min(100, Number(value) || 0)) : value } : b
      ),
    }));
  const addBar = () => setAbout((prev) => ({ ...prev, skillBars: [...prev.skillBars, { label: "", percent: 50 }] }));
  const removeBar = (i: number) =>
    setAbout((prev) => ({ ...prev, skillBars: prev.skillBars.filter((_, idx) => idx !== i) }));

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
      if (res.ok) set("profileImage", result.url);
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
        body: JSON.stringify({ about }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "About page saved! Changes are live." });
        setAbout(mergeAbout(data.about));
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
        <p className="font-black text-xs uppercase tracking-widest animate-pulse">Loading About Content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
            <UserCircle className="text-primary" /> About Page
          </h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">
            Edit every section of your public About page
          </p>
        </div>
        <Link
          href="/about"
          target="_blank"
          className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
        >
          <ExternalLink size={14} /> View Live Page
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Intro / Story */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Intro Section</h2>
          <div>
            <label className={labelClass}>Story Label (small caps)</label>
            <input className={inputClass} value={about.storyLabel} onChange={(e) => set("storyLabel", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Heading Prefix</label>
              <input className={inputClass} value={about.headingPrefix} onChange={(e) => set("headingPrefix", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Heading Highlight (purple)</label>
              <input className={inputClass} value={about.headingHighlight} onChange={(e) => set("headingHighlight", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Heading Suffix</label>
              <input className={inputClass} value={about.headingSuffix} onChange={(e) => set("headingSuffix", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Bio Paragraph</label>
            <textarea className={textareaClass} value={about.bio} onChange={(e) => set("bio", e.target.value)} />
          </div>
        </section>

        {/* Profile image */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Profile Image</h2>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-border shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about.profileImage} alt={about.profileName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-[240px] space-y-3">
              <div>
                <label className={labelClass}>Display Name</label>
                <input className={inputClass} value={about.profileName} onChange={(e) => set("profileName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Image URL</label>
                <div className="flex gap-3">
                  <input className={inputClass} value={about.profileImage} onChange={(e) => set("profileImage", e.target.value)} />
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
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xs uppercase tracking-widest text-primary">Stats</h2>
            <button type="button" onClick={addStat} className="inline-flex items-center gap-1.5 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
              <Plus size={14} /> Add Stat
            </button>
          </div>
          <div className="space-y-3">
            {about.stats.map((stat, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input className={`${inputClass} flex-1`} placeholder="Value (e.g. 150+)" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} />
                <input className={`${inputClass} flex-[2]`} placeholder="Label (e.g. Articles Written)" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} />
                <button type="button" onClick={() => removeStat(i)} className="p-2.5 text-secondary hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
              </div>
            ))}
            {about.stats.length === 0 && <p className="text-secondary text-xs italic">No stats. Add one above.</p>}
          </div>
        </section>

        {/* Toolkit + skills */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Technical Toolkit</h2>
          <div>
            <label className={labelClass}>Toolkit Heading</label>
            <input className={inputClass} value={about.toolkitHeading} onChange={(e) => set("toolkitHeading", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Toolkit Description</label>
            <textarea className={textareaClass} value={about.toolkitDescription} onChange={(e) => set("toolkitDescription", e.target.value)} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className={`${labelClass} mb-0`}>Skills</label>
            <button type="button" onClick={addSkill} className="inline-flex items-center gap-1.5 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
              <Plus size={14} /> Add Skill
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {about.skills.map((skill, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className={`${inputClass} flex-1`} placeholder="e.g. React" value={skill} onChange={(e) => updateSkill(i, e.target.value)} />
                <button type="button" onClick={() => removeSkill(i)} className="p-2.5 text-secondary hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className={`${labelClass} mb-0`}>Proficiency Bars</label>
            <button type="button" onClick={addBar} className="inline-flex items-center gap-1.5 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
              <Plus size={14} /> Add Bar
            </button>
          </div>
          <div className="space-y-3">
            {about.skillBars.map((bar, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input className={`${inputClass} flex-[3]`} placeholder="Label (e.g. Frameworks / Next.js)" value={bar.label} onChange={(e) => updateBar(i, "label", e.target.value)} />
                <div className="flex items-center gap-1.5 shrink-0">
                  <input type="number" min={0} max={100} className={`${inputClass} w-20 text-center`} value={bar.percent} onChange={(e) => updateBar(i, "percent", e.target.value)} />
                  <span className="font-black text-secondary text-sm">%</span>
                </div>
                <button type="button" onClick={() => removeBar(i)} className="p-2.5 text-secondary hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white dark:bg-dark/50 border border-border rounded-[2rem] p-8 space-y-6">
          <h2 className="font-black text-xs uppercase tracking-widest text-primary">Call To Action Button</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Button Text</label>
              <input className={inputClass} value={about.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Button Link</label>
              <input className={inputClass} value={about.ctaLink} onChange={(e) => set("ctaLink", e.target.value)} />
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
            {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Save size={16} /> Save About Page</>}
          </button>
        </div>
      </form>
    </div>
  );
}
