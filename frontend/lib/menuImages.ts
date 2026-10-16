/**
 * Curated high-resolution culinary photography for royal wedding catering dishes.
 */
export const DISH_PHOTO_MAP: Record<string, string> = {
  // Starters & Hors d'Oeuvres
  "paneer tikka angara": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
  "dahi ke sholay": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "crispy corn & water chestnut": "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
  "galouti kebab on mini sheermal": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  "murgh malai tikka": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
  "amritsari fish fingers": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",

  // Royal Main Course
  "paneer butter masala royal": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  "dal makhani bukhara": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  "subz dum handi diwani": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  "awadhi murgh dum biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  "kashmiri mutton rogan josh": "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80",
  "murgh lababdar": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",

  // Royal Breads & Grains
  "lucknowi saffron sheermal": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
  "amritsari chur chur naan": "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
  "kashmiri pulao": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
  "pudina laccha paratha": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",

  // Palatial Desserts
  "royal shahi tukda": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  "kesar badam malpua with rabdi": "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
  "moong dal halwa royal": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  "angoori rasmalai": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",

  // Mocktails & Beverages
  "shree royal rose sharbath": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  "spiced jamun shots": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
  "virgin blue lagoon": "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
  "kesar badam thandai": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
};

export const DEFAULT_DISH_FALLBACK =
  "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80";

export function getDishImage(dishName: string, backendImage?: string): string {
  if (backendImage && backendImage.length > 5) return backendImage;
  const key = (dishName || "").toLowerCase().trim();
  for (const [k, url] of Object.entries(DISH_PHOTO_MAP)) {
    if (key.includes(k) || k.includes(key)) return url;
  }
  return DEFAULT_DISH_FALLBACK;
}
