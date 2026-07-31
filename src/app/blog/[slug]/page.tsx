import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Clock, ArrowLeft, Share2, ChevronRight } from "lucide-react";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Setting from "@/models/Setting";
import { notFound } from "next/navigation";
import { getReadingTime } from "@/lib/readingTime";
import type { Metadata } from "next";
import InteractiveDetails from "@/components/InteractiveDetails";
import BlogCard from "@/components/BlogCard";

// ─── Data fetcher ──────────────────────────────────────────────────────────

async function getPost(slug: string) {
  await connectDB();
  const post = await Post.findOne({ slug }).lean();
  if (!post) return null;
  return post;
}

// ─── Dynamic Metadata (SEO) ───────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mindrovia.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const post: any = await getPost(resolvedParams.slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const seo = post.seo || {};

  const title = seo.metaTitle || post.title;
  const description = seo.metaDescription || post.excerpt;
  const ogImage = seo.ogImage || post.image;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: (seo.ogType as any) || "article",
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    twitter: {
      card: (seo.twitterCard as any) || "summary_large_image",
      title: seo.twitterTitle || title,
      description: seo.twitterDescription || description,
      images: seo.twitterImage || ogImage ? [seo.twitterImage || ogImage] : undefined,
    },
  };

  // Canonical URL
  if (seo.canonicalUrl) {
    metadata.alternates = { canonical: seo.canonicalUrl };
  }

  return metadata;
}

// ─── JSON-LD Structured Data builders ─────────────────────────────────────

function buildArticleSchema(post: any, seo: any, appName: string) {
  if (!seo?.articleSchema?.enabled) return null;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": seo.articleSchema.articleType || "BlogPosting",
    headline: seo.metaTitle || post.title,
    description: seo.metaDescription || post.excerpt,
    image: seo.ogImage || post.image,
    author: {
      "@type": "Person",
      name: post.author?.name || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: appName,
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  if (seo.articleSchema.keywords) {
    schema.keywords = seo.articleSchema.keywords
      .split(",")
      .map((k: string) => k.trim())
      .filter(Boolean);
  }

  return schema;
}

function buildFaqSchema(seo: any) {
  if (!seo?.faqSchema?.enabled || !seo.faqSchema.items?.length) return null;

  const validItems = seo.faqSchema.items.filter(
    (item: any) => item.question?.trim() && item.answer?.trim()
  );

  if (validItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((item: any) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildBreadcrumbSchema(post: any, seo: any) {
  if (!seo?.breadcrumbSchema?.enabled) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.category,
        item: `${SITE_URL}/blog?category=${encodeURIComponent(post.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}

// ─── Page component ────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const rawPost: any = await getPost(resolvedParams.slug);

  if (!rawPost) {
    notFound();
  }

  const post = {
    ...rawPost,
    _id: rawPost._id.toString(),
    createdAt: rawPost.createdAt ? rawPost.createdAt.toISOString() : null,
    updatedAt: rawPost.updatedAt ? rawPost.updatedAt.toISOString() : null,
  };

  // Fetch related posts (same category, excluding current, limit 3)
  const rawRelatedPosts = await Post.find({
    category: post.category,
    _id: { $ne: rawPost._id },
    published: true
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .lean();

  const relatedPosts = rawRelatedPosts.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  }));

  const seo = post.seo || {};
  const settings = await Setting.findOne().lean();
  const appName = settings?.appName || "MIND ROVIA";

  // Editor content often arrives with non-breaking spaces between words (a
  // paste artifact). Because &nbsp; never allows a line break, whole paragraphs
  // render as one unbreakable string and overflow horizontally. Convert them to
  // normal spaces so the text wraps naturally within the reading column.
  const cleanContent = (post.content || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");

  // Build structured data
  const articleSchema = buildArticleSchema(post, seo, appName);
  const faqSchema = buildFaqSchema(seo);
  const breadcrumbSchema = buildBreadcrumbSchema(post, seo);

  let customJsonLd: any = null;
  if (seo.customJsonLd) {
    try {
      customJsonLd = JSON.parse(seo.customJsonLd);
    } catch {
      // Invalid JSON — skip
    }
  }

  return (
    <>
      {/* Structured Data */}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {customJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(customJsonLd) }}
        />
      )}

      <Navbar />
      <main className="bg-white dark:bg-dark min-h-screen pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-6">

          {/* ── Visible Breadcrumb Navigation ───────────────── */}
          <nav aria-label="Breadcrumb" className="mb-8">
            {seo.breadcrumbSchema?.enabled ? (
              <ol className="flex flex-wrap items-center gap-1 text-[11px] font-bold uppercase tracking-widest">
                <li>
                  <Link href="/" className="text-secondary hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-border"><ChevronRight size={12} /></li>
                <li>
                  <Link href="/blog" className="text-secondary hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li className="text-border"><ChevronRight size={12} /></li>
                <li>
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="text-primary hover:underline transition-colors"
                  >
                    {post.category}
                  </Link>
                </li>
                <li className="text-border"><ChevronRight size={12} /></li>
                <li className="text-primary max-w-[260px] truncate" title={post.title}>
                  {post.title}
                </li>
              </ol>
            ) : (
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-secondary font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} /> Back to Insights
              </Link>
            )}
          </nav>

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
            className="blog-content max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {/* Interactive features (views, likes progress bar, comments list/form) */}
          <InteractiveDetails
            postId={post._id}
            postSlug={post.slug}
            initialLikes={post.likes || 0}
            initialViews={post.views || 0}
          />
        </article>

        {/* Related Posts section */}
        {relatedPosts.length > 0 && (
          <section className="bg-light dark:bg-dark/30 border-t border-border mt-20 py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black tracking-tight">Related Insights</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((item: any) => (
                  <BlogCard key={item._id} post={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
