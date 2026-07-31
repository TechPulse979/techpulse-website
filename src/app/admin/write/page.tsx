"use client";

import { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { categories } from '@/data/blog';
import { PenTool, FileText, Send, Image as ImageIcon, Tag, Loader2, AlertCircle, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from 'next/navigation';
import SeoPanel, { SeoData, defaultSeoData } from '@/components/SeoPanel';

// Dynamic import for ReactQuill to avoid SSR errors.
// Typed as `any` because next/dynamic's wrapper doesn't expose the forwarded `ref` prop in its types.
const ReactQuill: any = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-light dark:bg-dark animate-pulse rounded-2xl border border-border" />
});
import 'react-quill-new/dist/quill.snow.css';

function WriteBlogContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('edit');
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'Programming',
    published: true
  });

  const [seoData, setSeoData] = useState<SeoData>(defaultSeoData);
  const [categoriesList, setCategoriesList] = useState<string[]>(["AI", "Programming", "Tutorials", "Cloud", "DevOps"]);

  // Effect 1: mark component as mounted (client-side hydration) and fetch settings
  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.categories && data.categories.length > 0) {
          setCategoriesList(data.categories);
        }
      })
      .catch(err => console.error("Failed to load settings in write page", err));
  }, []);

  // Effect 2: fetch post data when editId is available AND component is mounted
  useEffect(() => {
    if (mounted && editId) {
      fetchPost();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, editId]);

  const fetchPost = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/posts/${editId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategoriesList(prev => {
            if (!prev.includes(data.category)) {
              return [...prev, data.category];
            }
            return prev;
          });
        }
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          image: data.image || '',
          category: data.category || 'Programming',
          published: data.published !== false
        });
        setSeoData({
          ...defaultSeoData,
          ...(data.seo || {}),
          articleSchema: { ...defaultSeoData.articleSchema, ...(data.seo?.articleSchema || {}) },
          faqSchema: { ...defaultSeoData.faqSchema, ...(data.seo?.faqSchema || {}) },
          breadcrumbSchema: { ...defaultSeoData.breadcrumbSchema, ...(data.seo?.breadcrumbSchema || {}) },
        });
      } else {
        setError("Failed to load post. Please try again.");
      }
    } catch (err) {
      console.error("Failed to fetch post", err);
      setError("Network error — could not load post data.");
    } finally {
      setFetching(false);
    }
  };

  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: data,
          });
          const result = await res.json();
          
          if (res.ok && quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', result.url);
            quill.setSelection(range.index + 1);
          } else {
            setError(result.error || "Image upload failed");
          }
        } catch (err) {
          setError("Failed to upload image inside blog");
        } finally {
          setUploading(false);
        }
      }
    };
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, image: result.url }));
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    if (!formData.image) {
      setError("Please upload a cover image.");
      setLoading(false);
      return;
    }

    if (!formData.content || formData.content === '<p><br></p>') {
      setError("Please write some content for your blog.");
      setLoading(false);
      return;
    }

    try {
      const url = editId ? `/api/posts/${editId}` : '/api/posts';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          seo: seoData,
          readTime: `${Math.ceil(formData.content.split(' ').length / 200)} min read`, 
          author: {
            name: session?.user?.name || "Admin",
            role: "Senior Editor",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'admin'}`
          }
        }),
      });

      if (response.ok) {
        setSuccess(true);
        if (!editId) {
          setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            image: '',
            category: 'Programming',
            published: true
          });
          setSeoData(defaultSeoData);
        } else {
          setTimeout(() => router.push('/admin/manage'), 2000);
        }
      } else {
        const errData = await response.json();
        setError(errData.error || "Failed to publish blog");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    if (editId) {
       setFormData(prev => ({ ...prev, title }));
       return;
    }
    const slug = title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  const editorContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const attachListeners = () => {
        const pickers = node.querySelectorAll(".ql-picker");
        if (pickers.length > 0) {
          pickers.forEach((picker) => {
            picker.addEventListener("mousedown", (e) => {
              e.preventDefault();
              e.stopPropagation();
            }, { passive: false });
          });
          return true;
        }
        return false;
      };

      if (!attachListeners()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (attachListeners() || attempts > 15) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
  }, []);

  // Don't render until client-side hydration is complete
  if (!mounted) return null;

  // Show a centered spinner while fetching post data in edit mode
  if (fetching) {
    return (
      <div className="max-w-5xl flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-black uppercase tracking-[0.2em] text-sm text-secondary">
          Loading Post Data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <PenTool size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
            {editId ? 'Edit Insight' : 'Create New Insight'}
          </h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">
            {editId ? 'Update your published post' : 'Share your knowledge with the world'}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark/50 border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl font-bold border border-red-500/20 flex items-center gap-3">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                <FileText size={14} className="text-primary" />
                Blog Title
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Mastering Advanced React Patterns"
                className="w-full px-6 py-4 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold text-lg transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                <Tag size={14} className="text-primary" />
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-6 py-4 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all appearance-none"
                >
                  {categoriesList.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">
                  Manage categories in{" "}
                  <a href="/admin/settings" className="text-primary hover:underline">Settings</a>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
              <ImageIcon size={14} className="text-primary" />
              Cover Image
            </label>
            
            <div className="relative">
              {formData.image ? (
                <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-2 border-primary/20 shadow-xl group">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video border-4 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {uploading ? <Loader2 className="animate-spin" size={40} /> : <Upload size={40} />}
                  </div>
                  <div className="text-center">
                    <p className="font-black uppercase tracking-widest text-sm">
                      {uploading ? 'Uploading to Pulse...' : 'Click to Upload Cover'}
                    </p>
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mt-1">Recommended: 1200 x 630px (1.91:1 Ratio)</p>
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mt-0.5">PNG, JPG or WEBP (Max 5MB)</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
              <Send size={14} className="text-primary" />
              Excerpt (Short Summary)
            </label>
            <textarea
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Give readers a quick taste of what to expect..."
              className="w-full px-6 py-4 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-medium transition-all resize-none shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
              <FileText size={14} className="text-primary" />
              Full Content (Rich Text)
            </label>
            <div ref={editorContainerRef} className="min-h-[400px] quill-editor">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                modules={quillModules}
                placeholder="Share your deep knowledge here..."
              />
            </div>
          </div>

          {/* ── SEO Management Panel ──────────────────────────── */}
          <SeoPanel
            seo={seoData}
            onChange={setSeoData}
            postTitle={formData.title}
            postExcerpt={formData.excerpt}
            postImage={formData.image}
            postCategory={formData.category}
          />

          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
             {success && (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-green-500/10 text-green-500 px-6 py-3 rounded-xl font-bold border border-green-500/20"
               >
                 🚀 {editId ? 'Insight updated successfully!' : 'Insight published successfully!'}
               </motion.div>
             )}
             <div className="flex-1" />

             {/* Live / Draft (ON/OFF) publish toggle */}
             <div className="flex items-center gap-3 px-5 py-3 bg-light dark:bg-dark border border-border rounded-2xl">
               <button
                 type="button"
                 role="switch"
                 aria-checked={formData.published}
                 onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
                 title={formData.published ? "Post is Live — click to save as Draft" : "Post is a Draft — click to make it Live"}
                 className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                   formData.published ? "bg-green-500" : "bg-secondary/30"
                 }`}
               >
                 <span
                   className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                     formData.published ? "translate-x-6" : "translate-x-1"
                   }`}
                 />
               </button>
               <div className="leading-tight">
                 <p className={`font-black uppercase tracking-widest text-xs ${formData.published ? "text-green-500" : "text-secondary"}`}>
                   {formData.published ? "Live" : "Draft"}
                 </p>
                 <p className="text-secondary text-[9px] font-bold uppercase tracking-widest">
                   {formData.published ? "Visible to everyone" : "Hidden from public"}
                 </p>
               </div>
             </div>

             <button
              disabled={loading || uploading}
              type="submit"
              className="w-full md:w-auto px-12 py-5 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20 flex items-center justify-center gap-4 uppercase tracking-widest text-sm"
            >
              {loading ? (editId ? 'Updating...' : 'Publishing...') : (editId ? 'Update Insight' : 'Publish Insight')}
              {!loading && <Send size={20} />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// useSearchParams() must be inside a Suspense boundary for the production build.
export default function WriteBlogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <WriteBlogContent />
    </Suspense>
  );
}
