"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { categories } from '@/data/blog';
import { PenTool, FileText, Send, Image as ImageIcon, Tag, Loader2, AlertCircle, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from 'next/navigation';

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
    category: 'Programming'
  });

  useEffect(() => {
    setMounted(true);
    if (editId) {
      fetchPost();
    }
  }, [editId]);

  const fetchPost = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/posts/${editId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          image: data.image,
          category: data.category
        });
      }
    } catch (err) {
      console.error("Failed to fetch post", err);
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
        setFormData({ ...formData, image: result.url });
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
            category: 'Programming'
          });
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
       setFormData({ ...formData, title });
       return;
    }
    const slug = title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, title, slug });
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <PenTool size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Create New Insight</h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">Share your knowledge with the world</p>
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
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-6 py-4 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all appearance-none"
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                      onClick={() => setFormData({ ...formData, image: '' })}
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
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Give readers a quick taste of what to expect..."
              className="w-full px-6 py-4 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-medium transition-all resize-none shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
              <FileText size={14} className="text-primary" />
              Full Content (Rich Text)
            </label>
            <div className="min-h-[400px] quill-editor">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={(content: string) => setFormData({ ...formData, content })}
                modules={quillModules}
                placeholder="Share your deep knowledge here..."
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
             {success && (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-green-500/10 text-green-500 px-6 py-3 rounded-xl font-bold border border-green-500/20"
               >
                 🚀 Insight published successfully!
               </motion.div>
             )}
             <div className="flex-1" />
             <button
              disabled={loading || uploading}
              type="submit"
              className="w-full md:w-auto px-12 py-5 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20 flex items-center justify-center gap-4 uppercase tracking-widest text-sm"
            >
              {loading ? 'Publishing...' : 'Publish Insight'}
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
