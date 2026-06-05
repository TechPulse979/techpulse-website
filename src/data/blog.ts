export interface Author {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: Author;
  date: string;
  readTime: string;
  featured?: boolean;
  // Present on documents returned from MongoDB
  _id?: string;
  createdAt?: string;
}

export const authors: Author[] = [
  {
    name: "Alex Rivera",
    role: "Senior Tech Writer",
    avatar: "https://i.pravatar.cc/150?u=alex",
    bio: "Passionate about simplifying complex tech concepts for everyone."
  },
  {
    name: "Sarah Chen",
    role: "UI/UX Designer",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    bio: "Exploring the intersection of design and technology."
  }
];

export const categories = ["All", "AI", "Programming", "Tutorials", "Cloud", "DevOps"];

export const posts: Post[] = [];
