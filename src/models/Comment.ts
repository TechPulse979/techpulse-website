import mongoose, { Schema, model, models } from 'mongoose';

const CommentSchema = new Schema({
  postSlug: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = models.Comment || model('Comment', CommentSchema);

export default Comment;
