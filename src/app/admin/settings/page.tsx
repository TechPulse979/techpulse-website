"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Globe,
  Layout,
  BarChart,
  Mail,
  Loader2,
  Save,
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
  Check,
  X
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [settings, setSettings] = useState<any>({
    appName: "MIND ROVIA",
    appLogoText: "MR",
    metaTitle: "Mind Rovia Blog – Expert Articles, Guides & Latest Insights",
    metaDescription: "Explore informative blogs on technology, business, health, lifestyle, finance, travel, education, and much more at Mind Rovia.",
    heroTopText: "Knowledge for the Curious Mind",
    heroTitlePrefix: "Discover Knowledge",
    heroTitleHighlight: "Explore Ideas",
    heroTitleSuffix: "and Grow Smarter",
    heroSubtitle: "Explore a world of knowledge where innovation meets inspiration. From technology and entrepreneurship to wellness, travel, finance, and everyday living, Mindrovia brings you content that truly matters.",
    stat1Value: "500+",
    stat1Label: "Articles",
    stat2Value: "50K+",
    stat2Label: "Readers",
    stat3Value: "12",
    stat3Label: "Categories",
    newsletterTitle: "Subscribe to our newsletter",
    newsletterSubtitle: "Get weekly updates on the latest tech trends and exclusive insights delivered to your inbox.",
    footerAbout: "Explore a world of knowledge where innovation meets inspiration. From technology and entrepreneurship to wellness, travel, finance, and everyday living, Mindrovia brings you content that truly matters.",
    twitterUrl: "#",
    githubUrl: "#",
    linkedinUrl: "#",
    categories: ["AI", "Programming", "Tutorials", "Cloud", "DevOps"],
  });

  const [activeTab, setActiveTab] = useState<"general" | "hero" | "stats" | "footer">("general");
  const [newCatName, setNewCatName] = useState("");

  // Category editor working model. Each item keeps `original` (its name as loaded
  // from the DB, or null if newly added) so we can tell renames apart from
  // add + delete when we build the cascade payload on save.
  type CatItem = { id: string; name: string; original: string | null };
  const [catItems, setCatItems] = useState<CatItem[]>([]);
  const [deletedOriginals, setDeletedOriginals] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [catError, setCatError] = useState("");
  const idCounter = useRef(0);
  const nextId = () => `cat-${idCounter.current++}`;

  const setCatsFromList = (list: string[]) => {
    setCatItems(list.map((c) => ({ id: nextId(), name: c, original: c })));
    setDeletedOriginals([]);
    setEditingId(null);
    setEditingValue("");
    setCatError("");
  };

  const isDuplicateName = (name: string, exceptId?: string) =>
    catItems.some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (isDuplicateName(trimmed)) {
      setCatError(`"${trimmed}" already exists.`);
      return;
    }
    setCatItems((prev) => [...prev, { id: nextId(), name: trimmed, original: null }]);
    setNewCatName("");
    setCatError("");
  };

  const startEditCategory = (item: CatItem) => {
    setEditingId(item.id);
    setEditingValue(item.name);
    setCatError("");
  };

  const cancelEditCategory = () => {
    setEditingId(null);
    setEditingValue("");
    setCatError("");
  };

  const saveEditCategory = (id: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setCatError("Category name cannot be empty.");
      return;
    }
    if (isDuplicateName(trimmed, id)) {
      setCatError(`"${trimmed}" already exists.`);
      return;
    }
    setCatItems((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
    cancelEditCategory();
  };

  const handleRemoveCategory = (item: CatItem) => {
    setCatItems((prev) => prev.filter((c) => c.id !== item.id));
    if (item.original) {
      setDeletedOriginals((prev) => (prev.includes(item.original!) ? prev : [...prev, item.original!]));
    }
    if (editingId === item.id) cancelEditCategory();
    setCatError("");
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data && !data.error) {
          // Merge defaults in case db does not have some keys
          setSettings((prev: any) => ({ ...prev, ...data }));
          const cats: string[] =
            data.categories && data.categories.length
              ? data.categories
              : ["AI", "Programming", "Tutorials", "Cloud", "DevOps"];
          setCatsFromList(cats);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Commit any category edit still open in the inline input before saving.
    if (editingId) {
      const trimmed = editingValue.trim();
      if (!trimmed || isDuplicateName(trimmed, editingId)) {
        setActiveTab("general");
        setCatError(!trimmed ? "Category name cannot be empty." : `"${trimmed}" already exists.`);
        return;
      }
      setCatItems((prev) => prev.map((c) => (c.id === editingId ? { ...c, name: trimmed } : c)));
    }

    setSaving(true);
    setMessage(null);

    // Build the category list plus the operations the API needs to cascade the
    // changes onto existing posts (rename -> update posts, delete -> reassign).
    const committed = catItems.map((c) =>
      c.id === editingId ? { ...c, name: editingValue.trim() } : c
    );
    const categories = committed.map((c) => c.name);
    const renames = committed
      .filter((c) => c.original && c.original !== c.name)
      .map((c) => ({ from: c.original as string, to: c.name }));
    const deletes = deletedOriginals.filter((o) => !categories.includes(o));

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, categories, categoryOps: { renames, deletes } }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully! Homepage and Layout will update instantly." });
        setSettings((prev: any) => ({ ...prev, ...data }));
        setCatsFromList(data.categories || categories);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-primary">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-black text-xs uppercase tracking-widest animate-pulse">Loading Configuration...</p>
      </div>
    );
  }

  const inputClass = "w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all";
  const textareaClass = "w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-all resize-none min-h-[100px]";
  const labelClass = "text-secondary font-bold uppercase tracking-widest text-[10px] mb-2 block";

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
          <Settings className="text-primary" /> Settings
        </h1>
        <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">Configure site metadata, brand identity, and layouts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
        {/* Settings Form */}
        <div className="bg-white dark:bg-dark/50 border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto gap-6 pb-2">
            {[
              { id: "general", label: "General & SEO", icon: <Globe size={18} /> },
              { id: "hero", label: "Hero Section", icon: <Layout size={18} /> },
              { id: "stats", label: "Stats & Socials", icon: <BarChart size={18} /> },
              { id: "footer", label: "Footer & Form", icon: <Mail size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-secondary hover:text-dark dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>App Name</label>
                    <input
                      type="text"
                      name="appName"
                      value={settings.appName}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Logo Initials / Text</label>
                    <input
                      type="text"
                      name="appLogoText"
                      value={settings.appLogoText}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>SEO Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={settings.metaTitle}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>SEO Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={settings.metaDescription}
                    onChange={handleChange}
                    className={textareaClass}
                    required
                  />
                </div>

                <div className="border-t border-border pt-6 mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`${labelClass} mb-0`}>Blog Categories</label>
                    <span className="text-secondary font-bold uppercase tracking-widest text-[10px]">
                      {catItems.length} {catItems.length === 1 ? "category" : "categories"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {catItems.map((item) =>
                      editingId === item.id ? (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-white dark:bg-dark border border-primary rounded-xl"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEditCategory(item.id);
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                cancelEditCategory();
                              }
                            }}
                            className="w-28 bg-transparent text-xs font-black uppercase tracking-wider focus:outline-none text-dark dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => saveEditCategory(item.id)}
                            title="Save name"
                            className="text-green-500 hover:scale-110 transition-all"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditCategory}
                            title="Cancel"
                            className="text-secondary hover:text-red-500 hover:scale-110 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <span
                          key={item.id}
                          className="group inline-flex items-center gap-2 pl-4 pr-2.5 py-2 bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider rounded-xl"
                        >
                          {item.name}
                          <span className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditCategory(item)}
                              title="Rename category"
                              className="opacity-60 hover:opacity-100 hover:text-dark dark:hover:text-white transition-all"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(item)}
                              title="Delete category"
                              className="opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        </span>
                      )
                    )}
                    {catItems.length === 0 && (
                      <p className="text-secondary text-xs italic">No categories defined. Please add at least one.</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Health, Finance, Travel"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (catError) setCatError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      className="flex-1 px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {catError && (
                    <p className="text-red-500 text-[11px] font-bold uppercase tracking-wider">{catError}</p>
                  )}

                  <p className="text-secondary text-[11px] font-medium leading-relaxed">
                    Renaming a category updates every post that uses it. Deleting one moves its posts to the first
                    category in the list. Changes are saved when you press <span className="font-black">Save Settings</span>.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "hero" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className={labelClass}>Hero Top Tagline / Badge</label>
                  <input
                    type="text"
                    name="heroTopText"
                    value={settings.heroTopText}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Title Prefix</label>
                    <input
                      type="text"
                      name="heroTitlePrefix"
                      value={settings.heroTitlePrefix}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Title Highlight (Purple)</label>
                    <input
                      type="text"
                      name="heroTitleHighlight"
                      value={settings.heroTitleHighlight}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Title Suffix</label>
                    <input
                      type="text"
                      name="heroTitleSuffix"
                      value={settings.heroTitleSuffix}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Hero Subtitle</label>
                  <textarea
                    name="heroSubtitle"
                    value={settings.heroSubtitle}
                    onChange={handleChange}
                    className={textareaClass}
                    required
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-light dark:bg-dark/30 rounded-2xl border border-border">
                    <label className={labelClass}>Stat 1 Value</label>
                    <input
                      type="text"
                      name="stat1Value"
                      value={settings.stat1Value}
                      onChange={handleChange}
                      className={`${inputClass} mb-3`}
                      required
                    />
                    <label className={labelClass}>Stat 1 Label</label>
                    <input
                      type="text"
                      name="stat1Label"
                      value={settings.stat1Label}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="p-4 bg-light dark:bg-dark/30 rounded-2xl border border-border">
                    <label className={labelClass}>Stat 2 Value</label>
                    <input
                      type="text"
                      name="stat2Value"
                      value={settings.stat2Value}
                      onChange={handleChange}
                      className={`${inputClass} mb-3`}
                      required
                    />
                    <label className={labelClass}>Stat 2 Label</label>
                    <input
                      type="text"
                      name="stat2Label"
                      value={settings.stat2Label}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="p-4 bg-light dark:bg-dark/30 rounded-2xl border border-border">
                    <label className={labelClass}>Stat 3 Value</label>
                    <input
                      type="text"
                      name="stat3Value"
                      value={settings.stat3Value}
                      onChange={handleChange}
                      className={`${inputClass} mb-3`}
                      required
                    />
                    <label className={labelClass}>Stat 3 Label</label>
                    <input
                      type="text"
                      name="stat3Label"
                      value={settings.stat3Label}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6 mt-6 space-y-6">
                  <h3 className="font-black text-xs uppercase tracking-widest text-primary">Social Links (Footer)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>Twitter URL</label>
                      <input
                        type="text"
                        name="twitterUrl"
                        value={settings.twitterUrl}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Github URL</label>
                      <input
                        type="text"
                        name="githubUrl"
                        value={settings.githubUrl}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Linkedin URL</label>
                      <input
                        type="text"
                        name="linkedinUrl"
                        value={settings.linkedinUrl}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "footer" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className={labelClass}>Newsletter Section Title</label>
                  <input
                    type="text"
                    name="newsletterTitle"
                    value={settings.newsletterTitle}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Newsletter Subtitle</label>
                  <textarea
                    name="newsletterSubtitle"
                    value={settings.newsletterSubtitle}
                    onChange={handleChange}
                    className={textareaClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Footer Brand About Description</label>
                  <textarea
                    name="footerAbout"
                    value={settings.footerAbout}
                    onChange={handleChange}
                    className={textareaClass}
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Save Button & Feedback Message */}
            <div className="flex flex-col gap-4 border-t border-border pt-8">
              {message && (
                <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-3 ${
                  message.type === "success" 
                    ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}>
                  <CheckCircle size={16} />
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving Config...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-dark dark:text-white">
            <Eye className="text-primary" /> Live Layout Preview
          </h2>

          <div className="bg-[#020617] text-white border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[4/3] max-w-md mx-auto">
            {/* Logo bar preview */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-xs text-white uppercase">
                  {settings.appLogoText || "T"}
                </div>
                <span className="font-black text-sm tracking-tight uppercase">
                  {settings.appName || "TechPulse"}
                </span>
              </div>
              <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                <span>Home</span>
                <span>Blog</span>
              </div>
            </div>

            {/* Hero details preview */}
            <div className="text-center flex flex-col items-center my-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-slate-800 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">
                {settings.heroTopText}
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight leading-[1.1] text-balance">
                {settings.heroTitlePrefix}{" "}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {settings.heroTitleHighlight}
                </span>{" "}
                {settings.heroTitleSuffix}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed max-w-xs">
                {settings.heroSubtitle}
              </p>
            </div>

            {/* Stats section preview */}
            <div className="flex items-center justify-center gap-8 border-t border-slate-800 pt-4">
              <div className="text-center">
                <div className="text-lg font-black">{settings.stat1Value}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{settings.stat1Label}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black">{settings.stat2Value}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{settings.stat2Label}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black">{settings.stat3Value}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{settings.stat3Label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
