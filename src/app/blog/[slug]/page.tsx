import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Clock, Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import { getReadingTime } from "@/lib/readingTime";

async function getPost(slug: string) {
  await connectDB();
  const post = await Post.findOne({ slug }).lean();
  if (!post) return null;
  return post;
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post: any = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-dark min-h-screen pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-secondary font-black uppercase text-[10px] tracking-widest mb-8 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Back to Insights
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-widest">
                <Clock size={14} /> {post.readTime || getReadingTime(post.content)}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-6 py-8 border-y border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden border border-border">
                  <Image 
                    src={post.author.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    alt={post.author.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">{post.author.name}</p>
                  <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-3 bg-light dark:bg-white/5 border border-border rounded-xl text-secondary hover:text-primary transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </header>

          <div className="relative aspect-[16/9] mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <Image 
              src={post.image} 
              alt={post.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-secondary prose-strong:text-dark dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
