import mongoose, { Schema, model, models } from 'mongoose';

const SettingSchema = new Schema({
  appName: { type: String, default: "MIND ROVIA" },
  appLogoText: { type: String, default: "MR" },
  metaTitle: { type: String, default: "Mind Rovia Blog – Expert Articles, Guides & Latest Insights" },
  metaDescription: { type: String, default: "Explore informative blogs on technology, business, health, lifestyle, finance, travel, education, and much more at Mind Rovia." },
  
  // Hero section
  heroTopText: { type: String, default: "Knowledge for the Curious Mind" },
  heroTitlePrefix: { type: String, default: "Discover Knowledge" },
  heroTitleHighlight: { type: String, default: "Explore Ideas" },
  heroTitleSuffix: { type: String, default: "and Grow Smarter" },
  heroSubtitle: { type: String, default: "Explore a world of knowledge where innovation meets inspiration. From technology and entrepreneurship to wellness, travel, finance, and everyday living, Mindrovia brings you content that truly matters." },
  
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
  // Categories list
  categories: { type: [String], default: ["AI", "Programming", "Tutorials", "Cloud", "DevOps"] },

  // About page content (managed via /admin/about)
  about: {
    storyLabel:        { type: String },
    headingPrefix:     { type: String },
    headingHighlight:  { type: String },
    headingSuffix:     { type: String },
    bio:               { type: String },
    profileName:       { type: String },
    profileImage:      { type: String },
    stats:             { type: [{ label: String, value: String }], default: undefined },
    toolkitHeading:    { type: String },
    toolkitDescription:{ type: String },
    skills:            { type: [String], default: undefined },
    skillBars:         { type: [{ label: String, percent: Number }], default: undefined },
    ctaText:           { type: String },
    ctaLink:           { type: String },
  },

  // Contact page content (managed via /admin/contact)
  contact: {
    heroLabel:          { type: String },
    headingPrefix:      { type: String },
    headingHighlight:   { type: String },
    subtitle:           { type: String },
    email:              { type: String },
    emailLabel:         { type: String },
    emailDescription:   { type: String },
    address:            { type: String },
    addressLabel:       { type: String },
    addressDescription: { type: String },
    phone:              { type: String },
    phoneLabel:         { type: String },
    phoneDescription:   { type: String },
    socialsTitle:       { type: String },
    twitterUrl:         { type: String },
    githubUrl:          { type: String },
    linkedinUrl:        { type: String },
    mapImage:           { type: String },
    studioName:         { type: String },
    studioTagline:      { type: String },
  },
}, { timestamps: true });

const Setting = models.Setting || model('Setting', SettingSchema);

export default Setting;
