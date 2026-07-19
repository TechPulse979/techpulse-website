import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder' &&
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_KEY !== 'placeholder';

    if (isCloudinaryConfigured) {
      try {
        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'blog_posts' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        return NextResponse.json({ url: result.secure_url });
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local file upload:', cloudinaryError);
      }
    }

    // Local upload fallback:
    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure folder exists
    await mkdir(uploadsDir, { recursive: true });
    
    // Write file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, new Uint8Array(buffer));
    
    // Return relative URL
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
