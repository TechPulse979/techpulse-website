import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
      return NextResponse.json({ error: 'Missing postSlug parameter' }, { status: 400 });
    }

    const comments = await Comment.find({ postSlug }).sort({ createdAt: -1 });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { postSlug, authorName, content } = await request.json();

    if (!postSlug || !authorName?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newComment = await Comment.create({
      postSlug,
      authorName,
      content,
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
