import mongoose, { Schema, model, models } from 'mongoose';

const PostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String, required: true }
  },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },

  // SEO Management Fields
  seo: {
    metaTitle:       { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    slug:            { type: String, default: '' },
    canonicalUrl:    { type: String, default: '' },

    // Open Graph
    ogTitle:       { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage:       { type: String, default: '' },
    ogType:        { type: String, default: 'article' },

    // Twitter Card
    twitterCard:        { type: String, default: 'summary_large_image' },
    twitterTitle:       { type: String, default: '' },
    twitterDescription: { type: String, default: '' },
    twitterImage:       { type: String, default: '' },

    // Article Schema
    articleSchema: {
      enabled:     { type: Boolean, default: true },
      articleType: { type: String, default: 'BlogPosting' },
      keywords:    { type: String, default: '' },
    },

    // FAQ Schema
    faqSchema: {
      enabled: { type: Boolean, default: false },
      items:   [{
        question: { type: String },
        answer:   { type: String }
      }]
    },

    // Breadcrumb Schema
    breadcrumbSchema: {
      enabled: { type: Boolean, default: true },
    },

    // Custom JSON-LD
    customJsonLd: { type: String, default: '' }
  }
}, { timestamps: true });

const Post = models.Post || model('Post', PostSchema);

export default Post;
