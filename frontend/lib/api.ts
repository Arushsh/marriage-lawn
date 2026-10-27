import {
  SiteSettings,
  Hall,
  Facility,
  Package,
  Review,
  FAQ,
  GalleryImage,
  VideoLink,
  AvailabilityResponse,
  EnquiryPayload,
  EnquiryResponse,
  ChatbotResponse,
  BookingPayload,
  BookingResponse,
  MenuCategory,
  ServiceItem,
  VoiceCallbackPayload,
  VoiceCallbackResponse,
  PaymentVerifyPayload,
  PaymentVerifyResponse,
} from "@/types/api";
import { fallbackSiteSettings } from "@/site.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 60 },
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await fetchJson<SiteSettings>("/site/");
  return data || fallbackSiteSettings;
}

export async function getHalls(): Promise<Hall[]> {
  const data = await fetchJson<Hall[]>("/halls/");
  return data || [];
}

export async function getFacilities(): Promise<Facility[]> {
  const data = await fetchJson<Facility[]>("/facilities/");
  return data || [];
}

export async function getPackages(): Promise<Package[]> {
  const data = await fetchJson<Package[]>("/packages/");
  return data || [];
}

export async function getReviews(): Promise<Review[]> {
  const data = await fetchJson<Review[]>("/reviews/");
  return data || [];
}

export async function getFAQs(): Promise<FAQ[]> {
  const data = await fetchJson<FAQ[]>("/faqs/");
  return data || [];
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const data = await fetchJson<{ results: GalleryImage[] } | GalleryImage[]>("/gallery/");
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || [];
}

export async function getPaginatedGallery(
  page = 1,
  category = "all"
): Promise<{ count: number; next: string | null; results: GalleryImage[] }> {
  const catParam = category && category !== "all" ? `&category=${encodeURIComponent(category)}` : "";
  const data = await fetchJson<{ count: number; next: string | null; results: GalleryImage[] }>(
    `/gallery/?page=${page}${catParam}`
  );
  if (!data) {
    return { count: 0, next: null, results: [] };
  }
  return {
    count: data.count || (Array.isArray(data) ? (data as unknown[]).length : 0),
    next: data.next || null,
    results: data.results || (Array.isArray(data) ? data : []),
  };
}

export async function getVideos(): Promise<VideoLink[]> {
  const data = await fetchJson<VideoLink[]>("/videos/");
  return data || [];
}

export async function getAvailability(start: string, end: string): Promise<AvailabilityResponse> {
  const data = await fetchJson<AvailabilityResponse>(`/availability/?start=${start}&end=${end}`, {
    cache: "no-store",
  });
  return data || { start, end, dates: [] };
}

export async function createEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  const res = await fetch(`${API_BASE}/enquiries/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to submit enquiry.");
  }
  return data;
}

export async function queryChatbot(message: string, sessionId = "web-session"): Promise<ChatbotResponse> {
  const res = await fetch(`${API_BASE}/chatbot/query/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) {
    return {
      reply: "We are currently experiencing a brief connection delay. Please feel free to reach out directly to our venue manager on WhatsApp!",
      intent: "error",
      matched_faq_id: null,
      suggestions: ["💬 Chat on WhatsApp", "📞 Call Venue Manager"],
      dynamic_data: {},
    };
  }
  return await res.json();
}

export async function getChatbotSuggestions(): Promise<string[]> {
  const data = await fetchJson<{ suggestions: string[] }>("/chatbot/suggestions/");
  return data?.suggestions || [
    "💰 View Packages & Pricing",
    "📅 Check Date Availability",
    "🏰 View Halls & Capacity",
    "💬 Chat on WhatsApp",
  ];
}

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  const res = await fetch(`${API_BASE}/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to create booking.");
  }
  return data;
}

export async function getMenu(vegOnly = false): Promise<MenuCategory[]> {
  const param = vegOnly ? "?veg=1" : "";
  const data = await fetchJson<MenuCategory[]>(`/menu/${param}`);
  return data || [];
}

export async function getServices(): Promise<ServiceItem[]> {
  const data = await fetchJson<ServiceItem[]>("/services/");
  return data || [];
}

export async function requestVoiceCallback(payload: VoiceCallbackPayload): Promise<VoiceCallbackResponse> {
  const res = await fetch(`${API_BASE}/voice/callback-request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to request AI callback.");
  }
  return data;
}

export async function verifyBookingPayment(
  reference: string,
  payload: PaymentVerifyPayload
): Promise<PaymentVerifyResponse> {
  const res = await fetch(`${API_BASE}/bookings/${reference}/verify-payment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Payment verification failed.");
  }
  return data;
}

export async function getBookingDetails(reference: string): Promise<unknown> {
  const data = await fetchJson<unknown>(`/bookings/${reference}/`, { cache: "no-store" });
  if (!data) {
    throw new Error("Booking not found.");
  }
  return data;
}


