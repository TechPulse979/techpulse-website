import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return NextResponse.json({ message: 'Welcome back! Your subscription has been reactivated.' });
      }
      return NextResponse.json({ error: 'This email is already subscribed!' }, { status: 400 });
    }

    await Subscriber.create({ email: email.toLowerCase().trim() });

    return NextResponse.json({ message: 'Thank you for subscribing to TechPulse!' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
  }
}
