import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { liked } = await request.json();

    const change = liked ? 1 : -1;

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: change } },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Safeguard to ensure likes never go below 0
    if (post.likes < 0) {
      post.likes = 0;
      await post.save();
    }

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error('Failed to update likes:', error);
    return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
  }
}
