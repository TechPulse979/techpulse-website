// Single source of truth for the editable content of the About & Contact pages.
// Used as Mongoose schema defaults, admin-form initial state, and public-page
// fallbacks (existing Setting docs won't have these keys until first save).

export interface Stat {
  label: string;
  value: string;
}

export interface SkillBar {
  label: string;
  percent: number;
}

export interface AboutContent {
  storyLabel: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  bio: string;
  profileName: string;
  profileImage: string;
  stats: Stat[];
  toolkitHeading: string;
  toolkitDescription: string;
  skills: string[];
  skillBars: SkillBar[];
  ctaText: string;
  ctaLink: string;
}

export interface ContactContent {
  heroLabel: string;
  headingPrefix: string;
  headingHighlight: string;
  subtitle: string;
  email: string;
  emailLabel: string;
  emailDescription: string;
  address: string;
  addressLabel: string;
  addressDescription: string;
  phone: string;
  phoneLabel: string;
  phoneDescription: string;
  socialsTitle: string;
  twitterUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  mapImage: string;
  studioName: string;
  studioTagline: string;
}

export const defaultAbout: AboutContent = {
  storyLabel: "The Story So Far",
  headingPrefix: "Building digital",
  headingHighlight: "legacies",
  headingSuffix: "through code.",
  bio: "I'm Alex Rivera, a Principal Developer and Content Architect. I bridge the gap between complex engineering concepts and intuitive, high-performance web experiences.",
  profileName: "Alex Rivera",
  profileImage:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
  stats: [
    { label: "Articles Written", value: "150+" },
    { label: "Years Experience", value: "8+" },
    { label: "Projects Delivered", value: "45+" },
    { label: "Tech Stacks", value: "12" },
  ],
  toolkitHeading: "Technical Toolkit",
  toolkitDescription:
    "I specialize in modern stacks that prioritize scale, type-safety, and exceptional UX.",
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Python",
    "Cloud Architecture",
    "UI Design",
  ],
  skillBars: [
    { label: "Frameworks / Next.js", percent: 95 },
    { label: "Systems / TypeScript", percent: 90 },
    { label: "Design / UI Architecture", percent: 85 },
  ],
  ctaText: "Hire for Projects",
  ctaLink: "/contact",
};

export const defaultContact: ContactContent = {
  heroLabel: "Connect",
  headingPrefix: "Get in",
  headingHighlight: "touch.",
  subtitle:
    "Have a visionary project in mind? We're here to turn your tech pulse into reality.",
  email: "hello@mindrovia.com",
  emailLabel: "Direct Channel",
  emailDescription: "Reach out via secure mail.",
  address: "San Francisco, CA 94107",
  addressLabel: "Global HQ",
  addressDescription: "Visit our innovation hub.",
  phone: "+1 (555) 000-0000",
  phoneLabel: "Vocal Pulse",
  phoneDescription: "Available for urgent signals.",
  socialsTitle: "Signal Channels",
  twitterUrl: "#",
  githubUrl: "#",
  linkedinUrl: "#",
  mapImage:
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop",
  studioName: "MIND ROVIA STUDIO",
  studioTagline: "Signal Center",
};

// Shallow-merge a stored (possibly partial/undefined) value over the defaults.
export function mergeAbout(stored: Partial<AboutContent> | undefined | null): AboutContent {
  const s = stored || {};
  return {
    ...defaultAbout,
    ...s,
    stats: s.stats && s.stats.length ? s.stats : defaultAbout.stats,
    skills: s.skills && s.skills.length ? s.skills : defaultAbout.skills,
    skillBars: s.skillBars && s.skillBars.length ? s.skillBars : defaultAbout.skillBars,
  };
}

export function mergeContact(stored: Partial<ContactContent> | undefined | null): ContactContent {
  return { ...defaultContact, ...(stored || {}) };
}
