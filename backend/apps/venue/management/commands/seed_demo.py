"""
Management command: seed_demo

Creates fictional demo data for "Shree Palace Lawn, Prayagraj".
All data is clearly marked as sample/demo.
Images use placeholder URLs (no real Cloudinary credentials needed).

Usage:
    python manage.py seed_demo
    python manage.py seed_demo --flush   # clears existing data first
"""

import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone


# ─── Placeholder image URL helper ─────────────────────────────────────────────
# Using picsum.photos as royalty-free placeholder images.
def placeholder(width: int, height: int, seed: int) -> str:
    return f"https://picsum.photos/seed/{seed}/{width}/{height}"


class Command(BaseCommand):
    help = "Seed the database with fictional demo data for Shree Palace Lawn."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing data before seeding.",
        )

    def handle(self, *args, **options):
        from apps.venue.models import SiteSettings, Hall, Facility, Package, Review, FAQ, MenuCategory, MenuItem, Service
        from apps.media.models import GalleryImage, VideoLink
        from apps.bookings.models import AvailabilityDate, Booking
        from apps.chatbot.models import ChatbotFAQ
        from apps.voice_calling.models import CallScript, CallLog

        if options["flush"]:
            self.stdout.write("Flushing existing demo data…")
            CallLog.objects.all().delete()
            CallScript.objects.all().delete()
            ChatbotFAQ.objects.all().delete()
            Booking.objects.all().delete()
            AvailabilityDate.objects.all().delete()
            MenuItem.objects.all().delete()
            MenuCategory.objects.all().delete()
            Service.objects.all().delete()
            FAQ.objects.all().delete()
            Review.objects.all().delete()
            VideoLink.objects.all().delete()
            GalleryImage.objects.all().delete()
            Package.objects.all().delete()
            Facility.objects.all().delete()
            Hall.objects.all().delete()
            SiteSettings.objects.all().delete()

        # ── SiteSettings ────────────────────────────────────────────────────
        if not SiteSettings.objects.exists():
            SiteSettings.objects.create(
                venue_name       = "Shree Palace Lawn",
                tagline          = "Where Your Wedding Story Begins",
                about_text       = (
                    "Shree Palace Lawn has been hosting grand weddings in Prayagraj since 2005. "
                    "Set on 2 acres of beautifully landscaped grounds, our venue offers everything "
                    "a family needs — spacious lawns, an air-conditioned banquet hall, bridal suites, "
                    "ample parking, and a dedicated team to make your event truly unforgettable. "
                    "Come visit and let us plan your perfect celebration."
                ),
                city             = "Prayagraj",
                address          = "Near Civil Lines, George Town, Prayagraj, Uttar Pradesh 211001",
                latitude         = "25.449440",
                longitude        = "81.842270",
                phone            = "+919876543210",
                whatsapp_number  = "919876543210",
                email            = "info@shreepalacelawn.example.com",
                opening_hours    = "Mon – Sun  9:00 AM – 9:00 PM",
                google_maps_url  = "https://maps.google.com/?q=Prayagraj",
                google_reviews_url = "https://maps.google.com/?q=Prayagraj",
                instagram_url    = "https://instagram.com",
                facebook_url     = "https://facebook.com",
                youtube_url      = "",
                rating_value     = "4.6",
                rating_count     = 210,
                weddings_hosted  = 500,
                primary_color    = "#7B1E3A",
                accent_color     = "#C9A227",
                hero_image       = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
                hero_video_url   = "",
                meta_title       = "Shree Palace Lawn | Marriage Lawn & Wedding Venue in Prayagraj",
                meta_description = (
                    "Book Shree Palace Lawn in Prayagraj for weddings and receptions. "
                    "Capacity 1,500 guests, ample parking, rooms, and packages. "
                    "Check dates and enquire on WhatsApp."
                ),
                notify_email     = "owner@example.com",
            )
            self.stdout.write(self.style.SUCCESS("✓ SiteSettings"))

        # ── Halls ───────────────────────────────────────────────────────────
        hall_data = [
            {
                "name": "Main Lawn",
                "description": "A sprawling open-air lawn perfect for grand wedding ceremonies and receptions under the stars.",
                "seating_capacity": 1000,
                "floating_capacity": 1500,
                "is_ac": False,
                "image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
                "order": 1,
            },
            {
                "name": "Royal Banquet Hall",
                "description": "Fully air-conditioned indoor banquet hall with modern lighting and sound system.",
                "seating_capacity": 300,
                "floating_capacity": 400,
                "is_ac": True,
                "image": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
                "order": 2,
            },
            {
                "name": "Garden Terrace",
                "description": "An intimate terrace garden ideal for engagement ceremonies and mehendi functions.",
                "seating_capacity": 150,
                "floating_capacity": 200,
                "is_ac": False,
                "image": "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80",
                "order": 3,
            },
        ]
        for i, data in enumerate(hall_data):
            Hall.objects.get_or_create(name=data["name"], defaults=data)
        self.stdout.write(self.style.SUCCESS("✓ Halls (3)"))

        # ── Facilities ──────────────────────────────────────────────────────
        facility_data = [
            ("Parking",          "parking",        "150+ cars"),
            ("Bridal Suite",     "bridal_room",    "Dedicated bridal room with vanity"),
            ("Guest Rooms",      "rooms",          "12 AC guest rooms on-site"),
            ("Generator Backup", "generator",      "100% power backup"),
            ("In-house Catering","catering",       "Veg & non-veg menu available"),
            ("Outside Caterer",  "outside_catering","Outside caterers allowed"),
            ("DJ & Sound",       "dj",             "Until 12 midnight"),
            ("Decoration",       "decoration",     "In-house décor team available"),
            ("Washrooms",        "washrooms",      "Separate gents & ladies"),
            ("CCTV Security",    "cctv",           "24×7 surveillance"),
        ]
        for order, (name, icon, detail) in enumerate(facility_data, start=1):
            Facility.objects.get_or_create(name=name, defaults={"icon": icon, "detail": detail, "order": order})
        self.stdout.write(self.style.SUCCESS("✓ Facilities (10)"))

        # ── Packages ────────────────────────────────────────────────────────
        packages = [
            {
                "name": "Basic",
                "description": "Perfect for smaller gatherings and budget-conscious families.",
                "price_from": "40000.00",
                "price_note": "per event · varies by date and guest count",
                "inclusions": [
                    "Main lawn (up to 500 guests)",
                    "Basic floral decoration",
                    "10 parking attendants",
                    "Generator backup",
                    "Washroom facilities",
                ],
                "is_popular": False,
                "show_price": True,
                "order": 1,
            },
            {
                "name": "Standard",
                "description": "Our most popular package — everything you need for a beautiful wedding.",
                "price_from": "75000.00",
                "price_note": "per event · includes lawn + banquet hall",
                "inclusions": [
                    "Main lawn + Banquet hall",
                    "Premium floral & lighting décor",
                    "Bridal suite",
                    "4 guest rooms",
                    "In-house catering coordinator",
                    "DJ sound system",
                    "Valet parking",
                    "Generator backup",
                    "CCTV security",
                ],
                "is_popular": True,
                "show_price": True,
                "order": 2,
            },
            {
                "name": "Premium",
                "description": "A completely bespoke experience for discerning families who want the best.",
                "price_from": None,      # show_price=False → "Get Quote"
                "price_note": "Custom pricing based on your requirements",
                "inclusions": [
                    "All three venues exclusively",
                    "Luxury décor by our designer team",
                    "All 12 guest rooms",
                    "Multi-cuisine catering",
                    "Live entertainment coordination",
                    "Dedicated event manager",
                    "Bridal mehendi & makeup coordination",
                    "Photography coordination",
                    "Day-of coordinator on-site",
                ],
                "is_popular": False,
                "show_price": False,    # Shows "Get Quote" on the frontend
                "order": 3,
            },
        ]
        for data in packages:
            Package.objects.get_or_create(name=data["name"], defaults=data)
        self.stdout.write(self.style.SUCCESS("✓ Packages (3, Basic ₹40k, Standard ₹75k, Premium → Get Quote)"))

        # ── Gallery Images (12 real landscape wedding photos) ───────────────
        gallery_data = [
            ("lawn",   "Grand open lawn illuminated for wedding reception", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"),
            ("lawn",   "Sprawling garden lawn with evening stage lighting",  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80"),
            ("mandap", "Traditional decorated wedding mandap with flowers",  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"),
            ("mandap", "Grand ceremonial stage and floral backdrop",         "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80"),
            ("dining", "Air-conditioned banquet hall dining arrangement",    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80"),
            ("dining", "Buffet and live food counter arrangement",           "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"),
            ("rooms",  "Spacious bridal dressing suite with vanity mirror",   "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"),
            ("rooms",  "Air-conditioned guest room with double bed",          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"),
            ("decor",  "Welcome entrance floral archway and fairy lighting", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80"),
            ("decor",  "Banquet centerpiece and floral table settings",      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"),
            ("night",  "Venue grounds illuminated under night fairy lights", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"),
            ("night",  "Evening celebration under starry lights and canopy", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"),
        ]
        for order, (category, caption, img_url) in enumerate(gallery_data, start=1):
            GalleryImage.objects.create(
                image=img_url,
                caption=caption,
                category=category,
                alt_text=caption,
                is_featured=order <= 6,
                order=order,
            )
        self.stdout.write(self.style.SUCCESS("✓ Gallery images (12 landscape photos)"))

        # ── Video ───────────────────────────────────────────────────────────
        VideoLink.objects.get_or_create(
            title="Shree Palace Lawn — Venue Walkthrough",
            defaults={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "order": 1},
        )
        self.stdout.write(self.style.SUCCESS("✓ Video link (1)"))

        # ── Reviews ─────────────────────────────────────────────────────────
        reviews = [
            ("Priya Sharma",    5, "We hosted our daughter's wedding here and it was magical! The lawn was beautifully decorated and the staff was very helpful throughout.",     "2026-02-15"),
            ("Raj Kumar",       5, "Excellent venue with great facilities. The banquet hall is spacious and air-conditioned. Food from their caterer was delicious.",              "2026-01-20"),
            ("Sunita Verma",    4, "Good venue overall. Parking was ample and the bridal suite was lovely. A little loud from the DJ next door but managed well.",               "2025-12-10"),
            ("Anil Gupta",      5, "Hosted our son's reception here. The entire team was professional and the venue looked stunning. Highly recommended for Prayagraj weddings.", "2025-11-05"),
            ("Meena Tripathi",  4, "Lovely venue with a great outdoor space. The management was responsive and helped us plan every detail. Would definitely recommend.",          "2025-10-22"),
        ]
        for name, rating, text, date_str in reviews:
            Review.objects.get_or_create(
                author_name=name,
                defaults={
                    "rating": rating,
                    "text": text,
                    "source": "google",
                    "date": datetime.date.fromisoformat(date_str),
                    "is_visible": True,
                },
            )
        self.stdout.write(self.style.SUCCESS("✓ Reviews (5)"))

        # ── FAQs ────────────────────────────────────────────────────────────
        faqs = [
            (1, "What is your maximum capacity?",
             "Our Main Lawn can accommodate up to 1,500 guests (floating). The Royal Banquet Hall seats 300 guests comfortably."),
            (2, "How much advance is required to confirm a booking?",
             "We require 30% of the package price as an advance to block your date. The balance is due 7 days before the event."),
            (3, "Can we bring our own caterer or decorator?",
             "Yes, outside caterers and decorators are welcome. We have an empanelled list of trusted vendors if you need recommendations."),
            (4, "Until what time is music and DJ allowed?",
             "Music and DJ are permitted until 12 midnight as per local regulations. Please plan your event schedule accordingly."),
            (5, "Are rooms available for the family and guests?",
             "Yes, we have 12 air-conditioned guest rooms and a dedicated bridal suite on the premises."),
            (6, "How many vehicles can the parking area accommodate?",
             "Our parking area can accommodate 150+ cars with dedicated parking attendants on duty."),
            (7, "What is your cancellation and refund policy?",
             "Cancellations made 30+ days before the event receive a 75% refund of the advance. Cancellations within 15 days are non-refundable. Please ask for our full policy document."),
            (8, "Is power backup available?",
             "Yes, we have a 100% generator backup to ensure your event is never disrupted by a power cut."),
        ]
        for order, question, answer in faqs:
            FAQ.objects.get_or_create(question=question, defaults={"answer": answer, "order": order})
        self.stdout.write(self.style.SUCCESS("✓ FAQs (8)"))

        # ── Menu Categories & Items ─────────────────────────────────────────
        menu_structure = [
            (
                "Starters & Hors d'Oeuvres",
                "starters",
                "Grand welcome appetizers, tandoori grills, and live royal stations.",
                [
                    ("Paneer Tikka Angara", "Chargrilled cottage cheese marinated in hung curd, Kashmiri deggi mirch, and royal spices.", True, True),
                    ("Dahi Ke Sholay", "Crispy bread rolls stuffed with hung spiced yogurt, bell peppers, and fresh coriander.", True, False),
                    ("Crispy Corn & Water Chestnut", "Wok-tossed golden corn kernels and water chestnuts with cracked pepper and scallions.", True, False),
                    ("Galouti Kebab on Mini Sheermal", "Melt-in-mouth smoked lamb patties infused with 32 royal spices, served on saffron sheermal.", False, True),
                    ("Murgh Malai Tikka", "Tender chicken suprêmes marinated in rich clotted cream, cashew purée, and green cardamom.", False, False),
                    ("Amritsari Fish Fingers", "Crispy spiced river sole fillets tossed in carom seeds and lemon herb seasoning.", False, False),
                ],
            ),
            (
                "Royal Main Course",
                "main-course",
                "Slow-simmered Awadhi, Mughlai, and North Indian curries cooked in handis.",
                [
                    ("Paneer Butter Masala Royal", "Fresh cottage cheese simmered in a velvety tomato-cashew satin gravy with churned butter.", True, True),
                    ("Dal Makhani Bukhara", "Slow-cooked black urad lentils simmered overnight with pure desi ghee and vine-ripened tomatoes.", True, True),
                    ("Subz Dum Handi Diwani", "Seasonal baby vegetables and lotus stem braised with whole roasted spices in a sealed clay pot.", True, False),
                    ("Awadhi Murgh Dum Biryani", "Fragrant long-grain aged basmati rice layered with succulent chicken, saffron milk, and kewra.", False, True),
                    ("Kashmiri Mutton Rogan Josh", "Tender goat shanks braised in an authentic Kashmiri aromatic red gravy with ratan jot.", False, True),
                    ("Murgh Lababdar", "Tandoori chicken chunks tossed with diced onions, tomatoes, and crushed coriander seeds.", False, False),
                ],
            ),
            (
                "Royal Breads & Grains",
                "breads-grains",
                "Freshly baked tandoori breads, saffron sheermals, and artisanal rice dishes.",
                [
                    ("Lucknowi Saffron Sheermal", "Traditional saffron-infused sweetened royal flatbread baked to golden perfection in the tandoor.", True, True),
                    ("Amritsari Chur Chur Naan", "Multi-layered flaky tandoor bread stuffed with spiced cottage cheese and potatoes, crushed with desi ghee.", True, False),
                    ("Kashmiri Pulao", "Fragrant basmati rice gently tossed with caramelized dry fruits, walnuts, cashews, and saffron.", True, False),
                    ("Pudina Laccha Paratha", "Layered whole wheat bread dusted with garden-fresh mint leaves and roasted carom seeds.", True, False),
                ],
            ),
            (
                "Palatial Desserts",
                "desserts",
                "Traditional halwas, chilled kulfis, and royal milk sweets prepared fresh.",
                [
                    ("Royal Shahi Tukda", "Ghee-crisped bread steeped in saffron sugar syrup, layered with thick condensed rabdi and silver leaf.", True, True),
                    ("Kesar Badam Malpua with Rabdi", "Fluffy syrup-soaked sweet pancakes served with chilled saffron-pistachio rabdi.", True, True),
                    ("Moong Dal Halwa Royal", "Slow-roasted split yellow lentils in pure desi ghee, garnished with toasted almond slivers and cardamom.", True, False),
                    ("Angoori Rasmalai", "Delicate cottage cheese dumplings floating in chilled saffron-pistachio infused milk.", True, True),
                ],
            ),
            (
                "Mocktails & Beverages",
                "beverages",
                "Refreshing signature welcome drinks, fruit elixirs, and traditional thandai.",
                [
                    ("Shree Royal Rose Sharbath", "Chilled organic damask rose nectar infused with sweet basil seeds and edible silver shimmer.", True, False),
                    ("Spiced Jamun Shots", "Cold-pressed black plum nectar spiced with rock salt and toasted cumin, served chilled.", True, True),
                    ("Virgin Blue Lagoon", "Sparkling citrus mocktail with blue curaçao syrup, fresh lime, and crushed mint.", True, False),
                    ("Kesar Badam Thandai", "Rich ceremonial milk blended with pounded almonds, fennel, black pepper, and pure saffron.", True, True),
                ],
            ),
        ]

        for cat_order, (cat_name, cat_slug, cat_desc, items) in enumerate(menu_structure, start=1):
            category, _ = MenuCategory.objects.get_or_create(
                slug=cat_slug,
                defaults={"name": cat_name, "description": cat_desc, "order": cat_order},
            )
            for item_order, (item_name, item_desc, is_veg, is_pop) in enumerate(items, start=1):
                MenuItem.objects.get_or_create(
                    category=category,
                    name=item_name,
                    defaults={
                        "description": item_desc,
                        "is_veg": is_veg,
                        "is_popular": is_pop,
                        "order": item_order,
                        "is_visible": True,
                    },
                )
        self.stdout.write(self.style.SUCCESS("✓ Catering Menu (5 Categories, 24 Dishes seeded)"))

        # ── Venue Services & Add-ons ────────────────────────────────────────
        services_data = [
            ("Royal Elephant & Vintage Car Entry", "royal-entry", "addon", "Royal procession arrival for bride and groom with vintage car or caparisoned elephant.", ["Red carpet royal aisle", "Rose petal cannons", "Traditional Dhol & Shehnai accompaniment"]),
            ("Vedic Mandap & Floral Decor", "mandap-decor", "addon", "Bespoke sacred mandap crafted with fresh marigold, jasmine, and exotic orchids.", ["Grand 4-pillar Vedic setup", "Illuminated floral backdrop", "Havankund and brass samagri setup"]),
            ("Grand Fireworks & Pyrotechnics", "fireworks-display", "addon", "Spectacular synchronized cold pyro fountains and sky fireworks for Varmala.", ["Cold pyro entrance sparklers", "Sky lantern release", "Stage CO2 jet fountains"]),
        ]
        for s_order, (s_title, s_slug, s_kind, s_desc, s_feat) in enumerate(services_data, start=1):
            Service.objects.get_or_create(
                slug=s_slug,
                defaults={
                    "title": s_title,
                    "kind": s_kind,
                    "short_description": s_desc,
                    "description": s_desc,
                    "features": s_feat,
                    "order": s_order,
                    "is_visible": True,
                },
            )
        self.stdout.write(self.style.SUCCESS("✓ Venue Services & Addons (3 seeded)"))

        # ── Sample Availability Dates ───────────────────────────────────────
        today = datetime.date.today()
        booked_offsets    = [7, 14, 21, 28, 35, 56]
        tentative_offsets = [10, 24, 42]

        for offset in booked_offsets:
            date = today + datetime.timedelta(days=offset)
            AvailabilityDate.objects.get_or_create(date=date, defaults={"status": "booked", "note": "Demo booking"})

        for offset in tentative_offsets:
            date = today + datetime.timedelta(days=offset)
            AvailabilityDate.objects.get_or_create(date=date, defaults={"status": "tentative", "note": "Demo tentative"})

        self.stdout.write(self.style.SUCCESS(f"✓ Availability dates (6 booked, 3 tentative — relative to {today})"))

        # ── Chatbot FAQs with Keywords ──────────────────────────────────────
        chatbot_faqs = [
            (
                "What is your maximum guest capacity?",
                "Our Main Lawn accommodates up to 1,500 floating guests. The Royal Banquet Hall seats 300 guests comfortably in air-conditioned luxury.",
                "capacity, guest, guests, people, how many, lawn size, banquet, hall",
                "capacity",
                1,
            ),
            (
                "How much advance is required to block a wedding date?",
                "We require a 30% advance of the estimated package cost to block and reserve your chosen date. The remaining balance is payable 7 days prior to the event.",
                "advance, payment, policy, block, deposit, percentage, token",
                "booking",
                2,
            ),
            (
                "Until what time is music and DJ allowed?",
                "As per local municipal and noise regulations, DJ and high-decibel music are permitted until 12:00 midnight.",
                "dj, music, midnight, loudspeakers, noise, timing, till what time",
                "timing",
                3,
            ),
            (
                "Can we bring our own outside caterer or decorator?",
                "Yes! You are welcome to bring your own empanelled caterer or decorator. We also offer curated in-house royal catering and decor packages.",
                "catering, food, caterer, outside food, kitchen, cooking, menu, non veg",
                "catering",
                4,
            ),
            (
                "Are air-conditioned rooms and bridal suites available?",
                "Yes, we provide 12 fully air-conditioned guest rooms and a private bridal dressing suite with dedicated vanity mirrors on the premises.",
                "rooms, bridal room, guest room, stay, overnight, accommodation, dressing",
                "parking_rooms",
                5,
            ),
            (
                "How many cars can fit in the parking area?",
                "Our secured on-site parking can easily accommodate over 150 vehicles with valet attendants and CCTV monitoring.",
                "parking, car, cars, vehicle, parking space, valet",
                "parking_rooms",
                6,
            ),
            (
                "Is power backup provided in case of electricity cuts?",
                "Yes, we have 100% heavy-duty generator power backup that seamlessly powers all air-conditioners, stage lights, and DJ systems without interruption.",
                "generator, power backup, electricity, power cut, light",
                "general",
                7,
            ),
            (
                "What packages and price ranges do you offer?",
                "We offer Basic (₹40k), Standard (₹75k), and bespoke Grand Royalty packages. Type 'show packages' or check our Pricing section to view full inclusions.",
                "package, packages, price, pricing, cost, rate, budget, per plate",
                "pricing",
                8,
            ),
        ]
        for q, a, kw, tag, ord in chatbot_faqs:
            ChatbotFAQ.objects.get_or_create(
                question=q,
                defaults={
                    "answer": a,
                    "keywords": kw,
                    "intent_tag": tag,
                    "order": ord,
                    "is_active": True,
                },
            )
        self.stdout.write(self.style.SUCCESS("✓ Chatbot FAQs with keyword intents (8)"))

        # ── Predefined AI Voice Calling Scripts (Hindi) ────────────────────────
        scripts = [
            (
                "New Lead Welcome & Qualification (Hindi)",
                "new_enquiry",
                "नमस्ते {customer_name} जी! {venue_name}, {city} में आपका हार्दिक स्वागत है। हमें {event_date} को आपके {event_type} के लिए पूछताछ प्राप्त हुई है। व्हाट्सएप पर तस्वीरें और संपूर्ण विवरण पाने के लिए 1 दबाएं, या भविष्य में कॉल न पाने के लिए 9 दबाएं।",
            ),
            (
                "Booking Advance Pending Reminder (Hindi)",
                "booking_pending",
                "नमस्ते {customer_name} जी! {venue_name} में {event_date} के लिए आपकी बुकिंग का एडवांस भुगतान अभी प्रतीक्षित है। अपनी मनपसंद तारीख सुरक्षित करने के लिए कृपया ऑनलाइन एडवांस पूरा करें। बुकिंग सहायता के लिए 1 दबाएं।",
            ),
            (
                "Booking Confirmed Warm Welcome (Hindi)",
                "booking_confirmed",
                "नमस्ते {customer_name} जी! बहुत-बहुत बधाई! {venue_name} में {event_date} के लिए आपकी शादी की बुकिंग सफलतापूर्वक कन्फर्म हो चुकी है! हमारे वेडिंग मैनेजर जल्द ही आपसे संपर्क करेंगे। धन्यवाद!",
            ),
            (
                "Instant AI Callback Request (Hindi)",
                "instant_callback",
                "नमस्ते {customer_name} जी! मैं {venue_name}, {city} से आपकी एआई वेडिंग साथी बोल रही हूँ। हमें {event_date} को आपके शुभ विवाह के लिए तत्काल कॉल का अनुरोध प्राप्त हुआ है। हमारे भव्य शाही लॉन और वातानुकूलित बैंक्वेट हॉल उपलब्ध हैं। व्हाट्सएप पर हमारा शाही ब्रोशर और कैटरिंग मेन्यू तुरंत पाने के लिए कीपैड पर 1 दबाएं, या कॉल समाप्त करने के लिए 9 दबाएं।",
            ),
        ]
        for name, trig, tpl in scripts:
            CallScript.objects.update_or_create(
                trigger_event=trig,
                defaults={"name": name, "script_template": tpl, "is_active": True},
            )
        self.stdout.write(self.style.SUCCESS("✓ AI Voice Calling Script Templates in Hindi (4)"))

        # ── Sample Confirmed Booking & AI Call Log ──────────────────────────
        main_lawn = Hall.objects.filter(name="Main Lawn").first() or Hall.objects.first()
        std_pkg = Package.objects.filter(name="Standard Package").first() or Package.objects.first()

        sample_booking, b_created = Booking.objects.get_or_create(
            booking_reference="BK-DEMO-001",
            defaults={
                "customer_name": "Rohan Malhotra",
                "customer_phone": "9876543210",
                "customer_email": "rohan@example.com",
                "hall": main_lawn,
                "package": std_pkg,
                "event_type": "wedding",
                "event_date": today + datetime.timedelta(days=21),
                "slot": "full_day",
                "guest_count": 600,
                "base_amount": 90000.00,
                "advance_amount": 27000.00,
                "paid_amount": 27000.00,
                "balance_amount": 63000.00,
                "status": "confirmed",
                "payment_status": "partial_advance",
                "payment_provider": "mock",
                "payment_order_id": "order_mock_001",
                "payment_transaction_id": "txn_mock_001",
            },
        )
        if b_created:
            from apps.bookings.models import BookingPayment
            BookingPayment.objects.create(
                booking=sample_booking,
                amount=27000.00,
                provider="mock",
                order_id="order_mock_001",
                payment_id="txn_mock_001",
                signature="mock_sig_demo",
                is_verified=True,
            )
            # Also log sample completed AI call
            CallLog.objects.create(
                recipient_name=sample_booking.customer_name,
                recipient_phone=sample_booking.customer_phone,
                booking=sample_booking,
                status="completed",
                duration_seconds=42,
                provider="mock",
                provider_call_id="mock_call_001",
                rendered_speech=f"Hello Rohan Malhotra, your booking at Shree Palace Lawn for {sample_booking.event_date} is CONFIRMED!",
                transcript="AI Assistant: Hello Rohan Malhotra, your booking at Shree Palace Lawn is CONFIRMED!\nCustomer: That's great, thank you so much!",
                recording_url="https://mock-telephony.local/recordings/demo.mp3",
                dtmf_digits="1",
            )
        self.stdout.write(self.style.SUCCESS("✓ Sample Bookings, Payments, and Voice Logs"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            "─────────────────────────────────────────────────\n"
            "  Demo seed complete for Shree Palace Lawn 🎉\n"
            "  Log in at /private-admin/ to review the data.\n"
            "─────────────────────────────────────────────────"
        ))
