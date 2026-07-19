import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Post from '@/models/Post';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    // Ensure default categories are populated if missing
    if (!setting.categories || setting.categories.length === 0) {
      setting.categories = ["AI", "Programming", "Tutorials", "Cloud", "DevOps"];
      await setting.save();
    }
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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

    // `categoryOps` is a transient instruction for cascading category changes
    // onto existing posts — it is not part of the Setting document itself.
    const { categoryOps, ...settingsData } = data;

    let setting = await Setting.findOne();
    if (setting) {
      Object.assign(setting, settingsData);
      await setting.save();
    } else {
      setting = await Setting.create(settingsData);
    }

    // Cascade category renames/deletes to posts so no post is left orphaned.
    if (categoryOps) {
      const renames = Array.isArray(categoryOps.renames) ? categoryOps.renames : [];
      const deletes = Array.isArray(categoryOps.deletes) ? categoryOps.deletes : [];

      for (const r of renames) {
        if (r && r.from && r.to && r.from !== r.to) {
          await Post.updateMany({ category: r.from }, { $set: { category: r.to } });
        }
      }

      if (deletes.length > 0) {
        // Reassign posts from deleted categories to the first remaining category.
        const fallback = setting.categories && setting.categories.length > 0 ? setting.categories[0] : null;
        if (fallback) {
          for (const name of deletes) {
            if (name && name !== fallback) {
              await Post.updateMany({ category: name }, { $set: { category: fallback } });
            }
          }
        }
      }
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
