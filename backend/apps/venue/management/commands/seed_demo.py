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
        from apps.venue.models import SiteSettings, Hall, Facility, Package, Review, FAQ
        from apps.media.models import GalleryImage, VideoLink
        from apps.bookings.models import AvailabilityDate

        if options["flush"]:
            self.stdout.write("Flushing existing demo data…")
            SiteSettings.objects.all().delete()
            Hall.objects.all().delete()
            Facility.objects.all().delete()
            Package.objects.all().delete()
            GalleryImage.objects.all().delete()
            VideoLink.objects.all().delete()
            Review.objects.all().delete()
            FAQ.objects.all().delete()
            AvailabilityDate.objects.all().delete()

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

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            "─────────────────────────────────────────────────\n"
            "  Demo seed complete for Shree Palace Lawn 🎉\n"
            "  Log in at /private-admin/ to review the data.\n"
            "─────────────────────────────────────────────────"
        ))
