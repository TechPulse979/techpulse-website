import fs from 'fs/promises';
import path from 'path';
import { Post } from '@/data/blog';

const DATA_FILE = path.join(process.cwd(), 'src/data/posts.json');

export async function getPosts(): Promise<Post[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find(p => p.slug === slug);
}

export async function savePost(newPost: any) {
  const posts = await getPosts();
  
  // Simple ID generation
  newPost.id = (posts.length + 1).toString();
  newPost.date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  posts.unshift(newPost);
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2));
  return newPost;
}
