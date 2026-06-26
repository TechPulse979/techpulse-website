import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Clock, Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import { getReadingTime } from "@/lib/readingTime";
import type { Metadata } from "next";

// ─── Data fetcher ──────────────────────────────────────────────────────────

async function getPost(slug: string) {
  await connectDB();
  const post = await Post.findOne({ slug }).lean();
  if (!post) return null;
  return post;
}

// ─── Dynamic Metadata (SEO) ───────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techpulse.dev";

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

function buildArticleSchema(post: any, seo: any) {
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
      name: "TechPulse",
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
  const post: any = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const seo = post.seo || {};

  // Build structured data
  const articleSchema = buildArticleSchema(post, seo);
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
