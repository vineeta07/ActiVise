export type CampaignUrgency = "critical" | "high" | "medium" | "low";
export type CampaignTag = "Urgent" | "Verified" | "Community-driven" | "Corporate-backed";
export type VerificationStatus = "pending" | "verified" | "rejected";

export type Campaign = {
  id: string;
  title: string;
  summary: string;
  locationName: string;
  lat: number;
  lng: number;
  urgency: CampaignUrgency;
  impactType: "Waste" | "Trees" | "Water" | "Air";
  tags: CampaignTag[];
  volunteers: number;
  targetVolunteers: number;
  co2PotentialKg: number;
  verified: boolean;
  sponsor?: string;
};

export const impactMetrics = {
  co2SavedKg: 284500,
  campaignsCompleted: 312,
  volunteersActive: 4921,
  reportsToday: 84,
};

export const campaigns: Campaign[] = [
  {
    id: "cmp-101",
    title: "Mithi River Plastic Recovery",
    summary: "Deploy volunteer teams for micro-plastic extraction and safe sorting.",
    locationName: "Bandra Kurla Complex, Mumbai",
    lat: 19.0663,
    lng: 72.8687,
    urgency: "critical",
    impactType: "Water",
    tags: ["Urgent", "Verified", "Corporate-backed"],
    volunteers: 96,
    targetVolunteers: 130,
    co2PotentialKg: 4200,
    verified: true,
    sponsor: "Tata GreenWorks",
  },
  {
    id: "cmp-102",
    title: "Aarey Urban Forest Restore",
    summary: "Restore native biodiversity corridors with guided plantation clusters.",
    locationName: "Aarey Colony, Mumbai",
    lat: 19.1489,
    lng: 72.8814,
    urgency: "high",
    impactType: "Trees",
    tags: ["Verified", "Community-driven"],
    volunteers: 214,
    targetVolunteers: 280,
    co2PotentialKg: 8600,
    verified: true,
  },
  {
    id: "cmp-103",
    title: "Juhu Coastline Cleanup Sprint",
    summary: "High-frequency weekend cleanup with AI-based waste categorization.",
    locationName: "Juhu Beach, Mumbai",
    lat: 19.0987,
    lng: 72.8267,
    urgency: "high",
    impactType: "Waste",
    tags: ["Urgent", "Verified", "Community-driven"],
    volunteers: 153,
    targetVolunteers: 180,
    co2PotentialKg: 5100,
    verified: true,
  },
  {
    id: "cmp-104",
    title: "Powai Lake Rejuvenation",
    summary: "Water quality improvement and shoreline restoration for biodiversity.",
    locationName: "Powai, Mumbai",
    lat: 19.1197,
    lng: 72.905,
    urgency: "medium",
    impactType: "Water",
    tags: ["Verified", "Corporate-backed"],
    volunteers: 74,
    targetVolunteers: 150,
    co2PotentialKg: 2900,
    verified: true,
    sponsor: "Infosys ESG",
  },
  {
    id: "cmp-105",
    title: "Andheri Traffic Air Audit",
    summary: "Sensor-backed monitoring and tree belt creation near congestion nodes.",
    locationName: "Andheri East, Mumbai",
    lat: 19.1136,
    lng: 72.8697,
    urgency: "medium",
    impactType: "Air",
    tags: ["Community-driven"],
    volunteers: 41,
    targetVolunteers: 120,
    co2PotentialKg: 3400,
    verified: false,
  },
  {
    id: "cmp-106",
    title: "Mahim Mangrove Shield",
    summary: "Community effort to secure mangrove edges and reduce dumping.",
    locationName: "Mahim Creek, Mumbai",
    lat: 19.0407,
    lng: 72.8466,
    urgency: "low",
    impactType: "Trees",
    tags: ["Community-driven"],
    volunteers: 36,
    targetVolunteers: 90,
    co2PotentialKg: 1900,
    verified: false,
  },
];

export const aiSignals = [
  "EXIF timestamp and geolocation consistency",
  "Scene similarity and landmark match confidence",
  "Pixel-level manipulation and splice artifact detection",
  "Before/after semantic delta score for impact proof",
];

export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Espanol" },
  { code: "fr", label: "Francais" },
  { code: "sw", label: "Swahili" },
];

export const corporateMilestones = [
  { title: "Baseline Carbon Audit", done: true },
  { title: "50 Percent Office Emission Reduction", done: true },
  { title: "Employee Climate Volunteering Program", done: true },
  { title: "Third-party ESG Verification", done: false },
  { title: "Net-zero Office Certification", done: false },
];

export const notificationFeed = [
  {
    id: "n1",
    title: "Verification completed",
    message: "Your submission for Juhu Coastline Cleanup is verified at 93 percent confidence.",
    time: "5m",
  },
  {
    id: "n2",
    title: "Campaign update",
    message: "Mithi River campaign moved to critical priority due to flood waste spike.",
    time: "18m",
  },
  {
    id: "n3",
    title: "Corporate sponsor added",
    message: "Tata GreenWorks pledged INR 4.2L for high-impact cleanup clusters.",
    time: "1h",
  },
];
