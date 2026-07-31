"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ManageBlogsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // ?all=true returns hidden/draft posts too so admins can manage every post.
        const res = await fetch("/api/posts?all=true");
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Toggle a post between Live (published) and Hidden. Optimistic update: flip the
  // UI immediately, then reconcile with the API — reverting only if it fails.
  const handleToggleStatus = async (id: string, current: boolean) => {
    const next = !current;
    setPosts((prev) => prev.map((p: any) => (p._id === id ? { ...p, published: next } : p)));

    try {
      const res = await fetch(`/api/posts/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      if (!res.ok) throw new Error("Request failed");
    } catch (err) {
      console.error("Failed to toggle publish status", err);
      // Revert on failure so the UI reflects the real database state.
      setPosts((prev) => prev.map((p: any) => (p._id === id ? { ...p, published: current } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p: any) => p._id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredPosts = posts.filter((post: any) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Manage Insights</h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px]">Total {posts.length} stories published</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white dark:bg-dark border border-border rounded-xl focus:outline-none focus:border-primary font-bold text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark/50 border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="font-black uppercase tracking-widest text-xs">Loading Archive...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-light dark:bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-secondary">Post Title</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-secondary">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-secondary">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-secondary">Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post: any) => (
                <tr key={post._id} className="border-b border-border last:border-0 hover:bg-light dark:hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-light dark:bg-dark rounded-xl flex-shrink-0" />
                      <div>
                        <p className="font-black text-sm group-hover:text-primary transition-colors">{post.title}</p>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{post.readTime}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={post.published !== false}
                        onClick={() => handleToggleStatus(post._id, post.published !== false)}
                        title={post.published !== false ? "Click to hide from public" : "Click to make live"}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          post.published !== false ? "bg-green-500" : "bg-secondary/30"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            post.published !== false ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          post.published !== false ? "text-green-500" : "text-secondary"
                        }`}
                      >
                        {post.published !== false ? "Live" : "Hidden"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-secondary text-xs font-bold uppercase tracking-widest">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/blog/${post.slug}`} 
                        target="_blank"
                        className="p-3 bg-light dark:bg-dark rounded-xl text-secondary hover:text-blue-500 transition-all"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <Link 
                        href={`/admin/write?edit=${post._id}`}
                        className="p-3 bg-light dark:bg-dark rounded-xl text-secondary hover:text-green-500 transition-all"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(post._id)}
                        className="p-3 bg-light dark:bg-dark rounded-xl text-secondary hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-secondary font-black uppercase tracking-widest text-sm">No posts found matching your pulse.</p>
          </div>
        )}
      </div>
    </div>
  );
}
