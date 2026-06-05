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
}, { timestamps: true });

const Post = models.Post || model('Post', PostSchema);

export default Post;
