import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Message from '@/models/Message';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 });
    }

    await connectDB();

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      activeAdmins,
      totalMessages,
      unreadMessages
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      Post.countDocuments({ published: false }),
      User.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false })
    ]);

    const categoriesBreakdown = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      activeAdmins,
      totalMessages,
      unreadMessages,
      categoriesBreakdown
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
