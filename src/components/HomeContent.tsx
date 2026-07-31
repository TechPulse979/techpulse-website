"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedSection from "@/components/FeaturedSection";
import BlogCard from "@/components/BlogCard";
import CategoryPills from "@/components/CategoryPills";
import { Post, categories } from "@/data/blog";
import { Layers, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

import Hero from "@/components/Hero";
import HomeCustomCode from "@/components/HomeCustomCode";

export default function HomeContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, settingsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/settings')
        ]);
        const postsData = await postsRes.json();
        const settingsData = await settingsRes.json();

        if (Array.isArray(postsData)) {
          setPosts(postsData);
        }
        if (settingsData && !settingsData.error) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = Array.isArray(posts) 
    ? (activeCategory === "All" ? posts : posts.filter(post => post.category === activeCategory))
    : [];

  const featuredPost = Array.isArray(posts) ? (posts.find(post => post.featured) || posts[0]) : null;

  return (
    <>
      <Navbar settings={settings} />
      <main className="bg-light dark:bg-dark min-h-screen">
        {loading ? (
          <div className="h-screen flex flex-col items-center justify-center text-primary gap-4">
            <Loader2 className="animate-spin" size={64} />
            <p className="font-black text-xl tracking-widest uppercase animate-pulse">Syncing Pulse...</p>
          </div>
        ) : (
          <>
            <Hero settings={settings} />
            {featuredPost && <FeaturedSection post={featuredPost} />}
            
            <section className="px-6 py-12 max-w-7xl mx-auto">
          {/* Explore Topics Header */}
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-12 bg-white dark:bg-dark/50 border border-border shadow-sm rounded-2xl flex items-center justify-center text-primary">
              <Layers size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-dark dark:text-white">Explore Topics</h2>
          </div>

          <div className="mb-20 overflow-visible">
            <CategoryPills 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
              categories={settings?.categories ? ["All", ...settings.categories.filter((c: string) => c !== "All")] : undefined}
            />
          </div>
          
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight">Latest Insights</h2>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                {filteredPosts.length} {filteredPosts.length === 1 ? "Post" : "Posts"}
              </span>
            </div>
            <Link href="/blog" className="flex items-center text-xs font-black uppercase tracking-widest text-primary hover:gap-2 transition-all">
               View All Posts
               <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post: any) => (
              <BlogCard key={post._id || post.id} post={post} />
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-32 bg-accent/20 rounded-[3rem] border-2 border-dashed border-primary/20">
              <h3 className="text-2xl font-black mb-2">No results matching your pulse</h3>
              <p className="text-secondary font-bold">Check back later for fresh insights.</p>
            </div>
          )}
        </section>

        {settings?.homeCustomCode && <HomeCustomCode code={settings.homeCustomCode} />}
          </>
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}
