import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH toggles the live/hidden (published) state of a post.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { published } = await request.json();

    if (typeof published !== 'boolean') {
      return NextResponse.json({ error: 'published must be a boolean' }, { status: 400 });
    }

    const post = await Post.findByIdAndUpdate(id, { published }, { new: true });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ _id: post._id, published: post.published });
  } catch (error) {
    console.error('Failed to update publish status:', error);
    return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
  }
}
