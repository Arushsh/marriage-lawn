"""
Chatbot Matching Engine.

Combines:
1. Keyword and tokenized intent matching.
2. Database-backed live lookups for pricing, availability, and venue capacity.
3. Fallback resolution with guided suggestion chips.
"""

import re
import datetime
from decimal import Decimal
from django.utils import timezone

from apps.venue.models import SiteSettings, Hall, Facility, Package
from apps.bookings.models import AvailabilityDate, Booking
from .models import ChatbotFAQ, ChatConversationLog


class ChatbotEngine:
    """Matches questions, queries live data, and formats answers."""

    # Predefined suggestion chips
    DEFAULT_SUGGESTIONS = [
        "💰 View Packages & Pricing",
        "📅 Check Date Availability",
        "🏰 View Halls & Capacity",
        "🍽️ Catering & Food Policy",
        "💬 Chat on WhatsApp",
    ]

    @classmethod
    def get_quick_replies(cls) -> list[str]:
        return cls.DEFAULT_SUGGESTIONS

    @classmethod
    def process_message(cls, message: str, session_id: str, ip_address: str | None = None) -> dict:
        text = (message or "").strip()
        lower_text = text.lower()

        # ── Check for Dynamic Database-Backed Intents ─────────────────────────

        # 1. PRICING INTENT (User asks about cost, rate, price, package)
        pricing_keywords = ["price", "cost", "package", "rate", "budget", "how much", "charge", "per plate", "per event", "pricing"]
        if any(w in lower_text for w in pricing_keywords):
            reply, suggestions, dynamic_data = cls._handle_pricing_query(lower_text)
            cls._log(session_id, text, reply, "pricing", None, Decimal("0.95"), ip_address)
            return {
                "reply": reply,
                "intent": "pricing",
                "matched_faq_id": None,
                "suggestions": suggestions,
                "dynamic_data": dynamic_data,
            }

        # 2. CAPACITY & VENUE INTENT (User asks about hall, capacity, guests)
        capacity_keywords = ["capacity", "guest", "guests", "people", "how big", "lawn size", "ac hall", "banquet", "hall"]
        if any(w in lower_text for w in capacity_keywords) and not any(w in lower_text for w in ["availab", "free date", "which date", "is it free"]):
            reply, suggestions, dynamic_data = cls._handle_capacity_query(lower_text)
            cls._log(session_id, text, reply, "capacity", None, Decimal("0.90"), ip_address)
            return {
                "reply": reply,
                "intent": "capacity",
                "matched_faq_id": None,
                "suggestions": suggestions,
                "dynamic_data": dynamic_data,
            }

        # 3. AVAILABILITY INTENT (User asks about dates, availability)
        avail_words = ["availab", "free", "vacant", "blocked", "tomorrow", "next week", "next month", "december", "january", "november", "october", "february"]
        has_avail_word = any(w in lower_text for w in avail_words) or bool(re.search(r"\b(date|dates|202\d{1})\b", lower_text))
        if has_avail_word:
            reply, suggestions, dynamic_data = cls._handle_availability_query(lower_text)
            cls._log(session_id, text, reply, "availability", None, Decimal("0.90"), ip_address)
            return {
                "reply": reply,
                "intent": "availability",
                "matched_faq_id": None,
                "suggestions": suggestions,
                "dynamic_data": dynamic_data,
            }

        # ── Keyword Matching Against Admin FAQs ──────────────────────────────
        best_faq, best_score = cls._match_faq(lower_text)

        if best_faq and best_score >= 0.40:
            site = SiteSettings.objects.first()
            venue_name = site.venue_name if site else "Our Venue"
            city = site.city if site else "Prayagraj"

            answer = best_faq.answer.replace("{venue_name}", venue_name).replace("{city}", city)

            cls._log(session_id, text, answer, best_faq.intent_tag, best_faq, Decimal(str(round(best_score, 2))), ip_address)
            return {
                "reply": answer,
                "intent": best_faq.intent_tag,
                "matched_faq_id": best_faq.pk,
                "suggestions": cls.DEFAULT_SUGGESTIONS[:3],
                "dynamic_data": {},
            }

        # ── Fallback ──────────────────────────────────────────────────────────
        fallback_reply = (
            "I'm here to assist you with everything related to our lawn and wedding services! "
            "I couldn't find an exact match for that question, but please select a topic below or connect with our coordinator directly on WhatsApp."
        )
        cls._log(session_id, text, fallback_reply, "fallback", None, Decimal("0.00"), ip_address)
        return {
            "reply": fallback_reply,
            "intent": "fallback",
            "matched_faq_id": None,
            "suggestions": cls.DEFAULT_SUGGESTIONS,
            "dynamic_data": {},
        }

    # ── Handlers for Live Database Queries ────────────────────────────────────

    @classmethod
    def _handle_pricing_query(cls, text: str) -> tuple[str, list[str], dict]:
        packages = list(Package.objects.all().order_by("order"))
        if not packages:
            return (
                "Our packages are customized according to your guest count and decor requirements. Please contact our manager for an exact quote.",
                ["Check Date Availability", "Chat on WhatsApp"],
                {},
            )

        lines = ["Here are our live package offerings:"]
        pkg_data = []
        for pkg in packages:
            if pkg.show_price and pkg.price_from:
                unit = "per event" if pkg.price_unit == "per_event" else "per plate"
                lines.append(f"• **{pkg.name}**: Starting from ₹{pkg.price_from:,.0f} ({unit})")
                pkg_data.append({"name": pkg.name, "price": str(pkg.price_from), "unit": pkg.price_unit})
            else:
                lines.append(f"• **{pkg.name}**: Custom quote (varies by season & guest count)")
                pkg_data.append({"name": pkg.name, "price": "Custom Quote", "unit": "custom"})

        lines.append("\nWe require a 30% advance to block your chosen date. Would you like to check available dates or request a formal quote?")
        return (
            "\n".join(lines),
            ["📅 Check Date Availability", "🏰 View Halls & Capacity", "💬 Chat on WhatsApp"],
            {"packages": pkg_data},
        )

    @classmethod
    def _handle_availability_query(cls, text: str) -> tuple[str, list[str], dict]:
        # Try to find a date in YYYY-MM-DD or DD Month format
        match_iso = re.search(r"\b(202\d{1}-\d{2}-\d{2})\b", text)
        target_date = None

        if match_iso:
            try:
                target_date = datetime.date.fromisoformat(match_iso.group(1))
            except ValueError:
                pass

        if target_date:
            today = timezone.now().date()
            if target_date < today:
                return (
                    f"The date {target_date.strftime('%d %B %Y')} is in the past! Please check future dates.",
                    ["📅 Check Upcoming Dates", "💰 View Packages & Pricing"],
                    {},
                )

            # Check if blocked in AvailabilityDate
            blocked = AvailabilityDate.objects.filter(date=target_date).first()
            if blocked and blocked.status == AvailabilityDate.STATUS_BOOKED:
                return (
                    f"📅 **{target_date.strftime('%d %B %Y')}** is currently **Booked**. "
                    f"We recommend checking dates a day before or after, or contacting us for tentative openings.",
                    ["📅 Check Another Date", "💬 Inquire on WhatsApp"],
                    {"date": str(target_date), "status": "booked"},
                )
            elif blocked and blocked.status == AvailabilityDate.STATUS_TENTATIVE:
                return (
                    f"📅 **{target_date.strftime('%d %B %Y')}** has a **Tentative reservation**. "
                    f"It might be released if not confirmed within 24 hours. Contact our coordinator to place a priority hold.",
                    ["💬 Place Priority Hold on WhatsApp", "📅 Check Another Date"],
                    {"date": str(target_date), "status": "tentative"},
                )
            else:
                return (
                    f"✨ Great news! **{target_date.strftime('%d %B %Y')}** is currently **Available** for reservation! "
                    f"You can book online now with a 30% advance or book an in-person venue visit.",
                    ["📝 Book Online Now", "💰 View Packages & Pricing", "💬 Chat on WhatsApp"],
                    {"date": str(target_date), "status": "available"},
                )

        # General availability response
        upcoming_booked = (
            AvailabilityDate.objects.filter(
                date__gte=timezone.now().date(),
                status=AvailabilityDate.STATUS_BOOKED,
            )
            .values_list("date", flat=True)[:5]
        )
        booked_str = ", ".join([d.strftime("%d %b") for d in upcoming_booked]) if upcoming_booked else "none currently"

        return (
            f"Our calendar is live! You can verify any specific date by typing e.g. 'Is 2026-11-25 available?' or using our interactive booking calendar on the home page.\n"
            f"(Note: Upcoming blocked dates include: {booked_str}).",
            ["💰 View Packages & Pricing", "🏰 View Halls & Capacity", "💬 Chat on WhatsApp"],
            {"upcoming_booked_dates": [str(d) for d in upcoming_booked]},
        )

    @classmethod
    def _handle_capacity_query(cls, text: str) -> tuple[str, list[str], dict]:
        halls = list(Hall.objects.all().order_by("order"))
        if not halls:
            return (
                "Our venue accommodates up to 1,500 guests across sprawling lawns and banquet halls.",
                ["💰 View Packages & Pricing", "📅 Check Date Availability"],
                {},
            )

        lines = ["Here is our venue capacity breakdown:"]
        hall_data = []
        for hall in halls:
            ac_tag = " (Fully Air Conditioned)" if hall.is_ac else " (Open Lawn)"
            lines.append(
                f"• **{hall.name}**{ac_tag}: Seats {hall.seating_capacity} guests | Up to {hall.floating_capacity} floating guests."
            )
            hall_data.append({
                "name": hall.name,
                "seating": hall.seating_capacity,
                "floating": hall.floating_capacity,
                "is_ac": hall.is_ac,
            })

        facilities = list(Facility.objects.values_list("name", flat=True)[:5])
        if facilities:
            lines.append(f"\nIncluded facilities: {', '.join(facilities)}, and full 100% generator power backup.")

        return (
            "\n".join(lines),
            ["💰 View Packages & Pricing", "📅 Check Date Availability", "💬 Chat on WhatsApp"],
            {"halls": hall_data},
        )

    # ── Matcher Logic ─────────────────────────────────────────────────────────

    @classmethod
    def _match_faq(cls, text: str) -> tuple[ChatbotFAQ | None, float]:
        """Calculates token overlap and keyword match scores against active FAQs."""
        faqs = ChatbotFAQ.objects.filter(is_active=True)
        tokens = set(re.findall(r"\w+", text))
        if not tokens:
            return None, 0.0

        best_faq = None
        best_score = 0.0

        for faq in faqs:
            score = 0.0
            # 1. Check comma-separated keywords
            if faq.keywords:
                kw_list = [k.strip().lower() for k in faq.keywords.split(",") if k.strip()]
                for kw in kw_list:
                    if kw in text:
                        score += 0.50 + (faq.confidence_boost * 0.05)
                    elif any(token in kw for token in tokens):
                        score += 0.20

            # 2. Check question text token overlap
            q_tokens = set(re.findall(r"\w+", faq.question.lower()))
            overlap = tokens.intersection(q_tokens)
            if q_tokens:
                score += (len(overlap) / len(q_tokens)) * 0.40

            if score > best_score:
                best_score = score
                best_faq = faq

        return best_faq, min(best_score, 1.0)

    @classmethod
    def _log(cls, session_id, user_msg, bot_resp, intent, faq, confidence, ip):
        try:
            ChatConversationLog.objects.create(
                session_id=session_id or "anonymous",
                user_message=user_msg,
                bot_response=bot_resp,
                matched_intent=intent or "",
                matched_faq=faq,
                confidence_score=confidence,
                user_ip=ip,
            )
        except Exception:
            pass
