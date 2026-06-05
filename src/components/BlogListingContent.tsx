"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import CategoryPills from "@/components/CategoryPills";
import { Post, categories } from "@/data/blog";
import { Search, Loader2 } from "lucide-react";

export default function BlogListingContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <main className="pt-32 bg-light dark:bg-dark min-h-screen">
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="bg-[#0F172A] p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] mb-12 md:mb-20 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
             
             <div className="relative z-10 text-center max-w-3xl mx-auto">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6 block">Our Pulse</span>
                <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">The Blog</h1>
                <p className="text-gray-400 text-xl leading-relaxed">
                  Deep dives into modern frameworks, architectural patterns, and the future of human-centered engineering.
                </p>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-16 bg-white dark:bg-dark/50 p-4 border border-border rounded-3xl shadow-sm">
            <div className="flex-1 w-full overflow-hidden">
               <CategoryPills 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
              />
            </div>
            <div className="w-full lg:max-w-sm relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-light dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-primary gap-4">
                <Loader2 className="animate-spin" size={48} />
                <p className="font-bold text-lg">Curating the latest insights...</p>
              </div>
            ) : (
              filteredPosts.map((post: any) => (
                <BlogCard key={post._id || post.id} post={post} />
              ))
            )}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-40 border-2 border-dashed border-border rounded-[3rem]">
              <h3 className="text-3xl font-extrabold mb-4">No insights found</h3>
              <p className="text-secondary text-lg">Adjust your search or vibe to find what you're looking for.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
