import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: (role || 'editor').toLowerCase()
    });

    return NextResponse.json({ message: 'User created successfully', user: { _id: newUser._id, name, email, role } });
  } catch (error: any) {
    console.error('Create User Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create user',
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : []
    }, { status: 500 });
  }
}
