import { SiteSettings } from "./types/api";

export const defaultTheme = {
  primary: "#6B1426",       // deep royal maroon
  primaryDark: "#4B0013",   // darker royal maroon
  accent: "#B8860B",        // warm antique gold
  bg: "#FDFBF7",            // ivory canvas
  surface: "#FFF8F5",       // subtle parchment surface
  card: "#FFFFFF",          // crisp card surface
  text: "#1E1B19",          // charcoal onyx
  muted: "#554243",         // muted umber
  border: "#E6DFC8",        // hairline divider
  success: "#2E7D32",       // available
  danger: "#6B1426",        // booked
  warning: "#B8860B",       // tentative
  radius: "0px",
};

export const fallbackSiteSettings: SiteSettings = {
  venue_name: "Shree Palace Lawn",
  tagline: "Where Grand Weddings Become Timeless Memories",
  about_text:
    "Shree Palace Lawn is Prayagraj's premier luxury wedding venue, offering expansive lush green lawns, an elegant air-conditioned banquet hall, and top-tier hospitality for up to 1,500 guests.",
  city: "Prayagraj",
  address: "Civil Lines, Near High Court, Prayagraj, Uttar Pradesh 211001",
  latitude: "25.4358",
  longitude: "81.8463",
  phone: "+919876543210",
  whatsapp_number: "919876543210",
  opening_hours: "Open daily: 9:00 AM – 9:00 PM for visits & bookings",
  google_maps_url: "https://maps.google.com/?q=Prayagraj",
  google_reviews_url: "https://search.google.com/local/reviews",
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  youtube_url: "https://youtube.com",
  rating_value: "4.8",
  rating_count: 142,
  weddings_hosted: 520,
  primary_color: defaultTheme.primary,
  accent_color: defaultTheme.accent,
  logo: "",
  hero_image: "/palace-exterior.jpg",
  hero_video_url: "",
  meta_title: "Shree Palace Lawn | Best Marriage Lawn & Banquet Hall in Prayagraj",
  meta_description:
    "Book Shree Palace Lawn for unforgettable weddings, receptions, and celebrations in Prayagraj. Spacious open lawn, AC banquet, and modern facilities.",
};
