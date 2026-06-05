import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'super-admin'], default: 'admin' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const adminEmail = 'admin@techpulse.com';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  await User.create({
    name: 'TechPulse Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'super-admin'
  });

  console.log('Admin user created: admin@techpulse.com / admin123');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
