import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// ─── Schemas ────────────────────────────────────────────────────────────────

const PostSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  slug:    { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image:   { type: String, required: true },
  category: { type: String, required: true },
  author: {
    name:   { type: String, required: true },
    role:   { type: String, required: true },
    avatar: { type: String, required: true },
  },
  featured:  { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  readTime:  { type: String },
  seo: {
    metaTitle:       { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    slug:            { type: String, default: '' },
    canonicalUrl:    { type: String, default: '' },
    ogTitle:         { type: String, default: '' },
    ogDescription:   { type: String, default: '' },
    ogImage:         { type: String, default: '' },
    ogType:          { type: String, default: 'article' },
    twitterCard:        { type: String, default: 'summary_large_image' },
    twitterTitle:       { type: String, default: '' },
    twitterDescription: { type: String, default: '' },
    twitterImage:       { type: String, default: '' },
    articleSchema: {
      enabled:     { type: Boolean, default: true },
      articleType: { type: String, default: 'BlogPosting' },
      keywords:    { type: String, default: '' },
    },
    faqSchema: {
      enabled: { type: Boolean, default: false },
      items:   [{ question: String, answer: String }],
    },
    breadcrumbSchema: {
      enabled: { type: Boolean, default: true },
    },
    customJsonLd: { type: String, default: '' },
  },
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

// ─── Blog content ────────────────────────────────────────────────────────────

const testPost = {
  title: 'The Complete Guide to React 19: New Features and Best Practices',
  slug: 'react-19-complete-guide-new-features-best-practices',
  excerpt:
    'React 19 introduces groundbreaking features like Server Components, the new compiler, and improved hooks. This comprehensive guide walks you through everything you need to know to upgrade your apps and leverage the latest capabilities.',
  category: 'Programming',
  featured: true,
  published: true,
  readTime: '8 min read',
  image:
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&q=80',
  author: {
    name:   'TechPulse Admin',
    role:   'Senior Editor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechPulseAdmin',
  },

  content: `
<h2>Introduction</h2>
<p>React 19 is here, and it's the biggest release in years. The React team has shipped a new compiler, stable Server Components, and a completely redesigned <strong>Actions API</strong> that simplifies async state management. Whether you're building a small side project or a massive enterprise application, React 19 has something for you.</p>

<h2>1. The React Compiler</h2>
<p>The most talked-about addition is the <strong>React Compiler</strong> (formerly React Forget). This compiler automatically memoizes your components and hooks, eliminating the need for manual <code>useMemo</code>, <code>useCallback</code>, and <code>React.memo</code> calls.</p>
<pre><code>// Before React 19 — manual memoization
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// After React 19 Compiler — just write normal code
const value = computeExpensiveValue(a, b);
const handleClick = () => doSomething(a, b);</code></pre>
<p>The compiler analyses your component's data flow at build time and automatically applies the optimal memoization strategy.</p>

<h2>2. Server Components (Stable)</h2>
<p>React Server Components (RSC) are now stable and fully integrated into the React core. They let you render components on the server, fetch data without client-side waterfalls, and ship zero JavaScript for server-only code.</p>
<pre><code>// app/blog/page.tsx — Server Component (no "use client" needed)
async function BlogPage() {
  const posts = await db.query('SELECT * FROM posts ORDER BY created_at DESC');

  return (
    &lt;main&gt;
      {posts.map(post =&gt; (
        &lt;BlogCard key={post.id} post={post} /&gt;
      ))}
    &lt;/main&gt;
  );
}</code></pre>

<h2>3. Actions API</h2>
<p>The new <strong>Actions API</strong> dramatically simplifies form handling and async mutations. You can now pass async functions directly to form <code>action</code> props and use the new <code>useActionState</code> hook.</p>
<pre><code>import { useActionState } from 'react';

async function submitComment(prevState, formData) {
  const comment = formData.get('comment');
  await saveToDatabase(comment);
  return { success: true, message: 'Comment posted!' };
}

function CommentForm() {
  const [state, formAction, isPending] = useActionState(submitComment, null);

  return (
    &lt;form action={formAction}&gt;
      &lt;textarea name="comment" /&gt;
      &lt;button disabled={isPending}&gt;
        {isPending ? 'Posting...' : 'Post Comment'}
      &lt;/button&gt;
      {state?.message &amp;&amp; &lt;p&gt;{state.message}&lt;/p&gt;}
    &lt;/form&gt;
  );
}</code></pre>

<h2>4. New Hooks: useOptimistic and use()</h2>
<p><strong>useOptimistic</strong> enables instant UI updates while an async operation completes in the background, giving users immediate feedback.</p>
<pre><code>function LikeButton({ postId, initialLikes }) {
  const [likes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, amount) =&gt; state + amount
  );

  return (
    &lt;button onClick={async () =&gt; {
      addOptimisticLike(1); // instant UI update
      await toggleLike(postId); // async server call
    }}&gt;
      ❤️ {likes}
    &lt;/button&gt;
  );
}</code></pre>

<h2>5. Document Metadata API</h2>
<p>React 19 now has native support for rendering <code>&lt;title&gt;</code>, <code>&lt;meta&gt;</code>, and <code>&lt;link&gt;</code> tags directly in your components — no need for external libraries like react-helmet.</p>
<pre><code>function BlogPost({ post }) {
  return (
    &lt;article&gt;
      &lt;title&gt;{post.title} | TechPulse&lt;/title&gt;
      &lt;meta name="description" content={post.excerpt} /&gt;
      &lt;link rel="canonical" href={\`https://techpulse.dev/blog/\${post.slug}\`} /&gt;
      &lt;h1&gt;{post.title}&lt;/h1&gt;
    &lt;/article&gt;
  );
}</code></pre>

<h2>Conclusion</h2>
<p>React 19 represents a massive leap forward in developer experience and performance. The compiler alone will save thousands of hours of manual optimization work across the ecosystem. Combined with stable Server Components and the elegant Actions API, React 19 is the best version of React yet.</p>
<p>Start experimenting with these features today — many are available in Next.js 15 and Remix v3 out of the box.</p>
  `.trim(),

  seo: {
    // ── Meta ──────────────────────────────────────────────────────────
    metaTitle:       'React 19 Guide: New Features, Compiler & Server Components',
    metaDescription:
      'Learn everything about React 19 — the new compiler, stable Server Components, Actions API, useOptimistic, and the use() hook. A practical guide with code examples.',
    slug:         '',   // use default post slug
    canonicalUrl: 'https://techpulse.dev/blog/react-19-complete-guide-new-features-best-practices',

    // ── Open Graph ────────────────────────────────────────────────────
    ogTitle:       'React 19 Complete Guide — New Features & Best Practices',
    ogDescription:
      'React 19 ships a new compiler, stable Server Components, the Actions API, and more. Explore every feature with clear code examples.',
    ogImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&q=80',
    ogType:  'article',

    // ── Twitter Card ──────────────────────────────────────────────────
    twitterCard:        'summary_large_image',
    twitterTitle:       'React 19: Everything You Need to Know 🚀',
    twitterDescription: 'New compiler, Server Components, Actions API and more — all explained with code examples.',
    twitterImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&q=80',

    // ── Article Schema ────────────────────────────────────────────────
    articleSchema: {
      enabled:     true,
      articleType: 'TechArticle',
      keywords:    'React 19, React Compiler, Server Components, Actions API, useOptimistic, JavaScript, Frontend Development',
    },

    // ── FAQ Schema ─────────────────────────────────────────────────────
    faqSchema: {
      enabled: true,
      items: [
        {
          question: 'What is the React 19 Compiler?',
          answer:
            'The React Compiler (formerly React Forget) automatically memoizes components and hooks at build time, eliminating the need for manual useMemo, useCallback, and React.memo in most cases.',
        },
        {
          question: 'Are React Server Components stable in React 19?',
          answer:
            'Yes, React Server Components are fully stable in React 19. They allow you to render components on the server, fetch data without client-side waterfalls, and ship zero JavaScript for server-only UI.',
        },
        {
          question: 'What is the Actions API in React 19?',
          answer:
            'The Actions API lets you pass async functions directly to form action props. Combined with useActionState, it simplifies form submission, loading states, and error handling without complex state machines.',
        },
        {
          question: 'Do I need to update my existing React app to use React 19?',
          answer:
            'React 19 is designed to be backward compatible. You can gradually adopt new features. The compiler is opt-in, and Server Components require a framework like Next.js 15.',
        },
      ],
    },

    // ── Breadcrumb Schema ─────────────────────────────────────────────
    breadcrumbSchema: {
      enabled: true,
    },

    // ── Custom JSON-LD ────────────────────────────────────────────────
    customJsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@type':    'HowTo',
      name:       'How to Upgrade to React 19',
      description: 'Step-by-step guide to upgrade your React application to version 19.',
      step: [
        { '@type': 'HowToStep', name: 'Update dependencies', text: 'Run npm install react@19 react-dom@19 in your project.' },
        { '@type': 'HowToStep', name: 'Enable the compiler', text: 'Install babel-plugin-react-compiler and add it to your Babel config.' },
        { '@type': 'HowToStep', name: 'Migrate to Actions API', text: 'Replace manual form state management with useActionState and form action props.' },
        { '@type': 'HowToStep', name: 'Test Server Components', text: 'Move data-fetching components to the server by removing "use client" directives.' },
      ],
    }),
  },
};

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seed() {
  if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI is missing in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected!\n');

  const existing = await Post.findOne({ slug: testPost.slug });
  if (existing) {
    console.log('⚠️   Post already exists — deleting and re-creating...');
    await Post.deleteOne({ slug: testPost.slug });
  }

  const post = await Post.create(testPost);
  console.log('🚀  Test blog post created successfully!\n');
  console.log(`   Title    : ${post.title}`);
  console.log(`   Slug     : ${post.slug}`);
  console.log(`   Category : ${post.category}`);
  console.log(`   URL      : http://localhost:3000/blog/${post.slug}`);
  console.log('\n📋  SEO fields seeded:');
  console.log(`   ✅  Meta Title       : ${post.seo.metaTitle}`);
  console.log(`   ✅  Meta Description : ${post.seo.metaDescription.substring(0, 60)}...`);
  console.log(`   ✅  Canonical URL    : ${post.seo.canonicalUrl}`);
  console.log(`   ✅  OG Title         : ${post.seo.ogTitle}`);
  console.log(`   ✅  OG Image         : ${post.seo.ogImage.substring(0, 60)}...`);
  console.log(`   ✅  Twitter Card     : ${post.seo.twitterCard}`);
  console.log(`   ✅  Article Schema   : ${post.seo.articleSchema.articleType} (enabled)`);
  console.log(`   ✅  FAQ Schema       : ${post.seo.faqSchema.items.length} Q&A items`);
  console.log(`   ✅  Breadcrumb       : enabled`);
  console.log(`   ✅  Custom JSON-LD   : HowTo schema`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
