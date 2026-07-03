import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
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
    
    let setting = await Setting.findOne();
    if (setting) {
      Object.assign(setting, data);
      await setting.save();
    } else {
      setting = await Setting.create(data);
    }
    
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
