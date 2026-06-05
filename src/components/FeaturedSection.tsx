import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { Post } from "@/data/blog";
import { getReadingTime } from "@/lib/readingTime";

export default function FeaturedSection({ post }: { post: Post }) {
  const readTime = post.readTime || getReadingTime(post.content);
  return (
    <section className="px-6 pt-32 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-[#241d52] to-[#0F172A] min-h-[500px] md:min-h-[600px] flex items-center">
          {/* Background image — now clearly visible, not buried */}
          <div className="absolute inset-0 z-0">
            <Image
              src={post.image}
              alt=""
              fill
              className="object-cover object-right opacity-70"
            />
            {/* Readability gradient: solid on the left where the text sits, fades to reveal the image on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1b1640] via-[#1b1640]/90 lg:via-[#1b1640]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Soft purple glow for a premium feel */}
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-3/4 bg-primary/30 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-1/3 h-1/2 bg-purple-500/20 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                <Sparkles size={12} /> Featured Story
              </span>
              <span className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-sm">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.05] tracking-tight text-balance">
              {post.title}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl font-medium line-clamp-3">
              {post.excerpt}
            </p>

            {/* Author + meta */}
            <div className="flex items-center gap-3 mb-12">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
                <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <span className="text-white">{post.author.name}</span>
                <span className="text-gray-500">•</span>
                <span className="inline-flex items-center gap-1 text-gray-400"><Clock size={12} /> {readTime}</span>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="group inline-flex items-center gap-3 bg-primary hover:bg-purple-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-xl shadow-primary/20 hover:scale-[1.02]"
            >
              Read Full Story
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
