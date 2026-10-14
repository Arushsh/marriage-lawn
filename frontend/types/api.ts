/**
 * API types matching backend Django REST Framework serializers exactly.
 * Reference: backend/apps/{venue,bookings,media}/serializers.py
 */

export interface SiteSettings {
  venue_name: string;
  tagline: string;
  about_text: string;
  city: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  phone: string;
  whatsapp_number: string;
  opening_hours: string;
  google_maps_url: string;
  google_reviews_url: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  rating_value: string;
  rating_count: number;
  weddings_hosted: number;
  primary_color: string;
  accent_color: string;
  logo: string;
  hero_image: string;
  hero_video_url: string;
  meta_title: string;
  meta_description: string;
}

export interface Hall {
  id: number;
  name: string;
  description: string;
  seating_capacity: number;
  floating_capacity: number;
  is_ac: boolean;
  image: string;
  order: number;
}

export interface Facility {
  id: number;
  name: string;
  icon: string;
  detail: string;
  order: number;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price_from: string | null;
  price_note: string;
  inclusions: string[];
  is_popular: boolean;
  show_price: boolean;
  order: number;
}

export interface Review {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  source: string;
  date: string | null;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface GalleryImage {
  id: number;
  image: string;
  category: "lawn" | "mandap" | "dining" | "rooms" | "decor" | "night" | string;
  caption: string;
  alt_text: string;
  is_featured: boolean;
  order: number;
}

export interface VideoLink {
  id: number;
  title: string;
  url: string;
  order: number;
}

export type AvailabilityStatus = "available" | "booked" | "tentative";

export interface AvailabilityDate {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
}

export interface AvailabilityResponse {
  start: string;
  end: string;
  dates: AvailabilityDate[];
}

export interface EnquiryPayload {
  name: string;
  phone: string;
  email?: string;
  event_type?: "wedding" | "reception" | "engagement" | "birthday" | "corporate" | "other" | string;
  event_date?: string | null;
  guest_count?: string;
  message?: string;
  source?: string;
  website?: string; // honeypot
}

export interface EnquiryResponse {
  id: number;
  message: string;
  whatsapp_prefill: string;
  whatsapp_number: string;
}
