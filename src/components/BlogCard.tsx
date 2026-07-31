import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, Heart } from "lucide-react";
import type { Post } from "@/data/blog";
import { getReadingTime } from "@/lib/readingTime";

export default function BlogCard({ post }: { post: Post }) {
  // Handle date from MongoDB (createdAt) or fallback to post.date or current date
  const rawDate = post.createdAt || post.date || new Date().toISOString();
  const dateObj = new Date(rawDate);
  const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const readTime = post.readTime || getReadingTime(post.content);

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-dark/50 border border-border rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 hover:border-primary/30 transition-all duration-500 p-4 pb-8">
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden rounded-[1.5rem] mb-6 shadow-sm">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Gradient + read affordance on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 dark:bg-dark/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-primary rounded-xl shadow-sm">
          {post.category}
        </span>
        <span className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg shadow-primary/30">
          <ArrowUpRight size={18} />
        </span>
      </Link>

      <div className="px-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              {readTime}
            </span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              {displayDate}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-bold text-gray-400">
            <span className="flex items-center gap-1">
              <Eye size={12} className="text-gray-400" />
              {post.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-red-500 fill-red-500/20" />
              {post.likes || 0}
            </span>
          </div>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl md:text-2xl font-black mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
            {post.title}
          </h3>
        </Link>
        <p className="text-secondary text-sm mb-8 line-clamp-3 leading-relaxed font-medium">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center pt-6 border-t border-border space-x-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-accent">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-dark dark:text-white uppercase whitespace-nowrap">{post.author.name}</span>
        </div>
      </div>
    </div>
  );
}
