import mongoose, { Schema, model, models } from 'mongoose';

const SettingSchema = new Schema({
  appName: { type: String, default: "TechPulse" },
  appLogoText: { type: String, default: "T" },
  metaTitle: { type: String, default: "TechPulse | Modern Blog for Tech Enthusiasts" },
  metaDescription: { type: String, default: "Stay updated with the latest in AI, Programming, Cloud, and more." },
  
  // Hero section
  heroTopText: { type: String, default: "The Future of Tech is Here" },
  heroTitlePrefix: { type: String, default: "Decoding the" },
  heroTitleHighlight: { type: String, default: "Digital Pulse" },
  heroTitleSuffix: { type: String, default: "of Tomorrow." },
  heroSubtitle: { type: String, default: "Explore deep dives into AI, Software Architecture, and the rapidly evolving tech landscape. Crafted for developers, by enthusiasts." },
  
  // Quick stats strip
  stat1Value: { type: String, default: "500+" },
  stat1Label: { type: String, default: "Articles" },
  stat2Value: { type: String, default: "50K+" },
  stat2Label: { type: String, default: "Readers" },
  stat3Value: { type: String, default: "12" },
  stat3Label: { type: String, default: "Categories" },

  // Newsletter Section
  newsletterTitle: { type: String, default: "Subscribe to our newsletter" },
  newsletterSubtitle: { type: String, default: "Get weekly updates on the latest tech trends and exclusive insights delivered to your inbox." },

  // Footer Section
  footerAbout: { type: String, default: "Staying ahead in the fast-paced world of technology. We deliver high-quality, research-driven content for engineers and tech enthusiasts." },
  twitterUrl: { type: String, default: "#" },
  githubUrl: { type: String, default: "#" },
  linkedinUrl: { type: String, default: "#" },
}, { timestamps: true });

const Setting = models.Setting || model('Setting', SettingSchema);

export default Setting;
