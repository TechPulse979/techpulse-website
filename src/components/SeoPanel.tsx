"use client";

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Globe,
  Share2,
  Twitter,
  FileCode,
  HelpCircle,
  Navigation,
  Code,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl: string;

  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;

  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;

  articleSchema: {
    enabled: boolean;
    articleType: string;
    keywords: string;
  };

  faqSchema: {
    enabled: boolean;
    items: FaqItem[];
  };

  breadcrumbSchema: {
    enabled: boolean;
  };

  customJsonLd: string;
}

export const defaultSeoData: SeoData = {
  metaTitle: '',
  metaDescription: '',
  slug: '',
  canonicalUrl: '',

  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'article',

  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',

  articleSchema: {
    enabled: true,
    articleType: 'BlogPosting',
    keywords: '',
  },

  faqSchema: {
    enabled: false,
    items: [],
  },

  breadcrumbSchema: {
    enabled: true,
  },

  customJsonLd: '',
};

// ─── Helper: character-count colour ────────────────────────────────────────

function charIndicator(value: string, max: number) {
  const len = value.length;
  if (len === 0) return { color: 'text-secondary', icon: null };
  if (len <= max) return { color: 'text-green-500', icon: <CheckCircle size={14} /> };
  if (len <= max + 20) return { color: 'text-yellow-500', icon: <AlertTriangle size={14} /> };
  return { color: 'text-red-500', icon: <XCircle size={14} /> };
}

// ─── Accordion section wrapper ─────────────────────────────────────────────

function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-light dark:bg-white/5 hover:bg-primary/5 transition-colors"
      >
        <span className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.15em]">
          {icon}
          {title}
        </span>
        {open ? <ChevronDown size={18} className="text-secondary" /> : <ChevronRight size={18} className="text-secondary" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Label helper ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2">
      {children}
    </label>
  );
}

// ─── Toggle switch ─────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Input styles ──────────────────────────────────────────────────────────

const inputClass =
  'w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all';

const textareaClass =
  'w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-medium text-sm transition-all resize-none';

const selectClass =
  'w-full px-5 py-3 bg-light dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all appearance-none';

// ─── Main component ────────────────────────────────────────────────────────

interface SeoPanelProps {
  seo: SeoData;
  onChange: (seo: SeoData) => void;
  postTitle: string;
  postExcerpt: string;
  postImage: string;
  postCategory: string;
}

export default function SeoPanel({
  seo,
  onChange,
  postTitle,
  postExcerpt,
  postImage,
  postCategory,
}: SeoPanelProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [jsonLdValid, setJsonLdValid] = useState<boolean | null>(null);

  // Helpers to update nested seo state
  const set = (field: keyof SeoData, value: any) => onChange({ ...seo, [field]: value });

  const setArticle = (field: string, value: any) =>
    onChange({ ...seo, articleSchema: { ...seo.articleSchema, [field]: value } });

  const setFaq = (field: string, value: any) =>
    onChange({ ...seo, faqSchema: { ...seo.faqSchema, [field]: value } });

  const setBreadcrumb = (field: string, value: any) =>
    onChange({ ...seo, breadcrumbSchema: { ...seo.breadcrumbSchema, [field]: value } });

  // Auto-fill from post data
  const autoFill = () => {
    onChange({
      ...seo,
      metaTitle: postTitle,
      metaDescription: postExcerpt,
      ogTitle: postTitle,
      ogDescription: postExcerpt,
      ogImage: postImage,
      twitterTitle: postTitle,
      twitterDescription: postExcerpt,
      twitterImage: postImage,
    });
  };

  // FAQ helpers
  const addFaqItem = () => {
    setFaq('items', [...seo.faqSchema.items, { question: '', answer: '' }]);
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const items = [...seo.faqSchema.items];
    items[index] = { ...items[index], [field]: value };
    setFaq('items', items);
  };

  const removeFaqItem = (index: number) => {
    setFaq('items', seo.faqSchema.items.filter((_: FaqItem, i: number) => i !== index));
  };

  // JSON-LD validation
  const validateJsonLd = (value: string) => {
    set('customJsonLd', value);
    if (!value.trim()) {
      setJsonLdValid(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonLdValid(true);
    } catch {
      setJsonLdValid(false);
    }
  };

  const metaTitleIndicator = charIndicator(seo.metaTitle, 60);
  const metaDescIndicator = charIndicator(seo.metaDescription, 160);

  return (
    <div className="space-y-4">
      {/* Panel toggle header */}
      <button
        type="button"
        onClick={() => setPanelOpen(!panelOpen)}
        className="w-full flex items-center justify-between px-8 py-5 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl hover:border-primary/40 transition-all group"
      >
        <span className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Search size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.15em]">
            Blog SEO Management
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`text-primary transition-transform duration-200 ${panelOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {/* Auto-fill button */}
              <button
                type="button"
                onClick={autoFill}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all"
              >
                <Sparkles size={14} />
                Auto-fill from post data
              </button>

              {/* ── 1. Meta Tags ──────────────────────────────────────── */}
              <AccordionSection
                title="Meta Tags"
                icon={<Globe size={16} className="text-primary" />}
                defaultOpen={true}
              >
                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Meta Title</FieldLabel>
                    <span className={`flex items-center gap-1 text-[10px] font-bold ${metaTitleIndicator.color}`}>
                      {metaTitleIndicator.icon}
                      {seo.metaTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seo.metaTitle}
                    onChange={(e) => set('metaTitle', e.target.value)}
                    placeholder="SEO-optimized page title (recommended ≤ 60 chars)"
                    className={inputClass}
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Meta Description</FieldLabel>
                    <span className={`flex items-center gap-1 text-[10px] font-bold ${metaDescIndicator.color}`}>
                      {metaDescIndicator.icon}
                      {seo.metaDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={seo.metaDescription}
                    onChange={(e) => set('metaDescription', e.target.value)}
                    placeholder="Compelling summary for search results (recommended ≤ 160 chars)"
                    className={textareaClass}
                  />
                </div>

                {/* URL Slug override */}
                <div>
                  <FieldLabel>URL Slug Override</FieldLabel>
                  <input
                    type="text"
                    value={seo.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    placeholder="custom-url-slug (leave empty to use post slug)"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-secondary mt-1 font-medium">
                    Override the auto-generated slug. Leave empty to use the default.
                  </p>
                </div>
              </AccordionSection>

              {/* ── 2. Canonical URL ──────────────────────────────────── */}
              <AccordionSection
                title="Canonical URL"
                icon={<LinkIcon size={16} className="text-primary" />}
              >
                <div>
                  <FieldLabel>Canonical URL</FieldLabel>
                  <input
                    type="url"
                    value={seo.canonicalUrl}
                    onChange={(e) => set('canonicalUrl', e.target.value)}
                    placeholder="https://example.com/blog/original-post"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-secondary mt-1 font-medium">
                    Set the preferred URL for this content to avoid duplicate content issues.
                  </p>
                </div>
              </AccordionSection>

              {/* ── 3. Open Graph ─────────────────────────────────────── */}
              <AccordionSection
                title="Open Graph Tags"
                icon={<Share2 size={16} className="text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>OG Title</FieldLabel>
                    <input
                      type="text"
                      value={seo.ogTitle}
                      onChange={(e) => set('ogTitle', e.target.value)}
                      placeholder="Title for social sharing"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <FieldLabel>OG Type</FieldLabel>
                    <select
                      value={seo.ogType}
                      onChange={(e) => set('ogType', e.target.value)}
                      className={selectClass}
                    >
                      <option value="article">article</option>
                      <option value="website">website</option>
                      <option value="blog">blog</option>
                    </select>
                  </div>
                </div>
                <div>
                  <FieldLabel>OG Description</FieldLabel>
                  <textarea
                    rows={2}
                    value={seo.ogDescription}
                    onChange={(e) => set('ogDescription', e.target.value)}
                    placeholder="Description shown in social previews"
                    className={textareaClass}
                  />
                </div>
                <div>
                  <FieldLabel>OG Image URL</FieldLabel>
                  <input
                    type="url"
                    value={seo.ogImage}
                    onChange={(e) => set('ogImage', e.target.value)}
                    placeholder="https://... (leave empty to use cover image)"
                    className={inputClass}
                  />
                  {seo.ogImage && (
                    <div className="mt-3 w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-border">
                      <img src={seo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </AccordionSection>

              {/* ── 4. Twitter Card ───────────────────────────────────── */}
              <AccordionSection
                title="Twitter Card Tags"
                icon={<Twitter size={16} className="text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Card Type</FieldLabel>
                    <select
                      value={seo.twitterCard}
                      onChange={(e) => set('twitterCard', e.target.value)}
                      className={selectClass}
                    >
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="summary">Summary</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Twitter Title</FieldLabel>
                    <input
                      type="text"
                      value={seo.twitterTitle}
                      onChange={(e) => set('twitterTitle', e.target.value)}
                      placeholder="Title for Twitter cards"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Twitter Description</FieldLabel>
                  <textarea
                    rows={2}
                    value={seo.twitterDescription}
                    onChange={(e) => set('twitterDescription', e.target.value)}
                    placeholder="Description for Twitter cards"
                    className={textareaClass}
                  />
                </div>
                <div>
                  <FieldLabel>Twitter Image URL</FieldLabel>
                  <input
                    type="url"
                    value={seo.twitterImage}
                    onChange={(e) => set('twitterImage', e.target.value)}
                    placeholder="https://... (leave empty to use cover image)"
                    className={inputClass}
                  />
                </div>
              </AccordionSection>

              {/* ── 5. Article Schema ─────────────────────────────────── */}
              <AccordionSection
                title="Article Schema"
                icon={<FileCode size={16} className="text-primary" />}
              >
                <div className="flex items-center justify-between">
                  <FieldLabel>Enable Article Schema</FieldLabel>
                  <Toggle
                    enabled={seo.articleSchema.enabled}
                    onChange={(v) => setArticle('enabled', v)}
                  />
                </div>
                {seo.articleSchema.enabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    <div>
                      <FieldLabel>Article Type</FieldLabel>
                      <select
                        value={seo.articleSchema.articleType}
                        onChange={(e) => setArticle('articleType', e.target.value)}
                        className={selectClass}
                      >
                        <option value="BlogPosting">BlogPosting</option>
                        <option value="NewsArticle">NewsArticle</option>
                        <option value="TechArticle">TechArticle</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Keywords</FieldLabel>
                      <input
                        type="text"
                        value={seo.articleSchema.keywords}
                        onChange={(e) => setArticle('keywords', e.target.value)}
                        placeholder="react, javascript, web development (comma-separated)"
                        className={inputClass}
                      />
                    </div>
                  </motion.div>
                )}
              </AccordionSection>

              {/* ── 6. FAQ Schema ─────────────────────────────────────── */}
              <AccordionSection
                title="FAQ Schema"
                icon={<HelpCircle size={16} className="text-primary" />}
              >
                <div className="flex items-center justify-between">
                  <FieldLabel>Enable FAQ Schema</FieldLabel>
                  <Toggle
                    enabled={seo.faqSchema.enabled}
                    onChange={(v) => setFaq('enabled', v)}
                  />
                </div>
                {seo.faqSchema.enabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {seo.faqSchema.items.map((item: FaqItem, idx: number) => (
                      <div
                        key={idx}
                        className="relative p-5 bg-light dark:bg-dark rounded-xl border border-border space-y-3"
                      >
                        <button
                          type="button"
                          onClick={() => removeFaqItem(idx)}
                          className="absolute top-3 right-3 p-1.5 text-secondary hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div>
                          <FieldLabel>Question {idx + 1}</FieldLabel>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                            placeholder="What is...?"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <FieldLabel>Answer</FieldLabel>
                          <textarea
                            rows={2}
                            value={item.answer}
                            onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                            placeholder="The answer is..."
                            className={textareaClass}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFaqItem}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-border rounded-xl text-secondary hover:text-primary hover:border-primary/50 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                      <Plus size={14} />
                      Add FAQ Item
                    </button>
                  </motion.div>
                )}
              </AccordionSection>

              {/* ── 7. Breadcrumb Schema ──────────────────────────────── */}
              <AccordionSection
                title="Breadcrumb Schema"
                icon={<Navigation size={16} className="text-primary" />}
              >
                <div className="flex items-center justify-between">
                  <FieldLabel>Enable Breadcrumb Schema</FieldLabel>
                  <Toggle
                    enabled={seo.breadcrumbSchema.enabled}
                    onChange={(v) => setBreadcrumb('enabled', v)}
                  />
                </div>
                {seo.breadcrumbSchema.enabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center gap-2 px-5 py-3 bg-light dark:bg-dark rounded-xl border border-border text-xs font-bold text-secondary">
                      <span>Home</span>
                      <ChevronRight size={12} />
                      <span>Blog</span>
                      <ChevronRight size={12} />
                      <span className="text-primary">{postCategory || 'Category'}</span>
                      <ChevronRight size={12} />
                      <span className="text-primary truncate max-w-[200px]">
                        {postTitle || 'Post Title'}
                      </span>
                    </div>
                    <p className="text-[10px] text-secondary mt-2 font-medium">
                      Breadcrumbs are auto-generated from your post&apos;s category and title.
                    </p>
                  </motion.div>
                )}
              </AccordionSection>

              {/* ── 8. Custom JSON-LD ─────────────────────────────────── */}
              <AccordionSection
                title="Custom JSON-LD Schema"
                icon={<Code size={16} className="text-primary" />}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Custom JSON-LD</FieldLabel>
                    {jsonLdValid !== null && (
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold ${
                          jsonLdValid ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {jsonLdValid ? (
                          <>
                            <CheckCircle size={14} /> Valid JSON
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Invalid JSON
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={6}
                    value={seo.customJsonLd}
                    onChange={(e) => validateJsonLd(e.target.value)}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "...",\n  ...\n}`}
                    className={`${textareaClass} font-mono text-xs`}
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-secondary mt-1 font-medium">
                    Add any custom structured data in JSON-LD format. Must be valid JSON.
                  </p>
                </div>
              </AccordionSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
