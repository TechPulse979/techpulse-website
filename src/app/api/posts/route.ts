import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Add default author info if not provided
    const postData = {
      ...data,
      author: data.author || {
        name: session.user?.name || "Admin",
        role: "Editor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
      }
    };
    
    const newPost = await Post.create(postData);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
