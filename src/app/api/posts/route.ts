import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Admins can request every post (including hidden/draft) with ?all=true.
    // Public callers always get only published posts.
    const { searchParams } = new URL(request.url);
    if (searchParams.get('all') === 'true') {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const posts = await Post.find().sort({ createdAt: -1 });
      return NextResponse.json(posts);
    }

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
    
    // Validate custom JSON-LD if provided
    if (data.seo?.customJsonLd) {
      try {
        JSON.parse(data.seo.customJsonLd);
      } catch {
        return NextResponse.json(
          { error: 'Invalid Custom JSON-LD: must be valid JSON' },
          { status: 400 }
        );
      }
    }

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
