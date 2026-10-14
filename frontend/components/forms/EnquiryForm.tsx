"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SiteSettings, EnquiryResponse } from "@/types/api";
import { createEnquiry } from "@/lib/api";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatDisplayDate, isPastDate } from "@/lib/dates";
import { Button } from "@/components/ui/Button";

// Zod schema matching DRF backend validation rules
const enquirySchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your name.")
    .max(150, "Name must be under 150 characters."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  event_type: z.enum([
    "wedding",
    "reception",
    "engagement",
    "birthday",
    "other",
  ]),
  event_date: z
    .string()
    .optional()
    .refine((val) => !val || !isPastDate(val), {
      message: "Event date cannot be in the past.",
    }),
  guest_count: z.enum([
    "",
    "under_200",
    "200_500",
    "500_800",
    "800_1200",
    "above_1200",
  ]),
  message: z.string().max(500, "Message cannot exceed 500 characters.").optional(),
  website: z.string().optional(), // Honeypot field
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

interface EnquiryFormProps {
  site: SiteSettings;
  selectedDate?: string;
  onClearSelectedDate?: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  site,
  selectedDate,
  onClearSelectedDate,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<EnquiryResponse | null>(null);
  const [apiError, setApiError] = useState<{
    message: string;
    isRateLimit?: boolean;
    whatsappUrl?: string;
  } | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      event_type: "wedding",
      event_date: selectedDate || "",
      guest_count: "200_500",
      message: "",
      website: "", // Honeypot remains empty
    },
  });

  const currentDateValue = useWatch({ control, name: "event_date" });

  // Keep form date in sync when selectedDate changes from calendar
  useEffect(() => {
    if (selectedDate) {
      setValue("event_date", selectedDate, { shouldValidate: true });
    }
  }, [selectedDate, setValue]);

  // Read optional ?package= query param on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pkg = params.get("package");
      if (pkg) {
        setValue("message", `Inquiring regarding the ${pkg} package.`);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: EnquiryFormData) => {
    if (submitting) return;
    setSubmitting(true);
    setApiError(null);

    try {
      const response = await createEnquiry({
        name: data.name,
        phone: data.phone,
        event_type: data.event_type,
        event_date: data.event_date || null,
        guest_count: data.guest_count || undefined,
        message: data.message || "",
        source: selectedDate ? "calendar" : "website",
        website: data.website, // Honeypot
      });

      setSuccessData(response);
    } catch (err: unknown) {
      const errorObj = err as { status?: number; details?: unknown };
      const status = errorObj.status;

      // Construct a reliable WhatsApp fallback URL without losing inputs
      const eventDateStr = data.event_date ? formatDisplayDate(data.event_date) : "a date TBD";
      const waFallbackText = `Hi ${site.venue_name}, I want to enquire for ${data.name} (Phone: ${data.phone}) for an event on ${eventDateStr}.`;
      const fallbackUrl = buildWhatsAppUrl(site.whatsapp_number, waFallbackText);

      if (status === 429) {
        setApiError({
          message:
            "You have submitted multiple enquiries recently. Please continue directly on WhatsApp or call our desk.",
          isRateLimit: true,
          whatsappUrl: fallbackUrl,
        });
      } else {
        setApiError({
          message:
            "Unable to submit right now due to a network issue. Your details have been preserved below. You can also contact us directly on WhatsApp.",
          whatsappUrl: fallbackUrl,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──────────────────────────────────────────────────────────
  if (successData) {
    const waUrl = buildWhatsAppUrl(
      successData.whatsapp_number || site.whatsapp_number,
      successData.whatsapp_prefill ||
        `Hi ${site.venue_name}, I just submitted an inquiry on your website.`
    );

    return (
      <div className="bg-surface rounded-2xl p-8 border border-black/[0.08] space-y-6">
        <div className="space-y-2">
          <h3 className="font-serif text-[20px] sm:text-[24px] font-normal leading-[1.25] text-primary">
            Enquiry Received
          </h3>
          <p className="text-[16px] text-text/80 max-w-[60ch] leading-[1.65]">
            Thank you. Our management team will contact you shortly on your phone to discuss your event details and schedule a walkthrough.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="whatsapp" size="md" className="w-full sm:w-auto">
              Continue on WhatsApp
            </Button>
          </a>
          <Button
            type="button"
            variant="text"
            onClick={() => {
              setSuccessData(null);
              setApiError(null);
            }}
            className="text-sm"
          >
            Send another enquiry
          </Button>
        </div>
      </div>
    );
  }

  // ── Form State ─────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-surface rounded-2xl p-6 sm:p-8 border border-black/[0.08] space-y-5"
    >
      <div className="space-y-1">
        <h3 className="font-serif text-[20px] sm:text-[24px] font-normal leading-[1.25] text-primary">
          Check Availability &amp; Rates
        </h3>
        <p className="text-sm text-muted">
          Fill in your details below and we will get back to you within 24 hours.
        </p>
      </div>

      {/* API / Rate limit error notice with WhatsApp fallback */}
      {apiError && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 text-sm text-stone-800 space-y-3">
          <p>{apiError.message}</p>
          {apiError.whatsappUrl && (
            <a
              href={apiError.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-medium text-emerald-800 underline underline-offset-2"
            >
              Continue enquiry on WhatsApp →
            </a>
          )}
        </div>
      )}

      {/* Honeypot field (hidden from real users) */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        style={{ display: "none" }}
        {...register("website")}
      />

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-text">
          Full Name <span className="text-red-700">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Ramesh Kumar"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
          className={`w-full h-12 px-4 rounded-lg border text-base text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            errors.name ? "border-red-400" : "border-black/[0.12]"
          }`}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-red-700">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-text">
          Mobile Number (10 Digits) <span className="text-red-700">*</span>
        </label>
        <div className="flex h-12 rounded-lg border border-black/[0.12] overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1">
          <span className="bg-black/[0.04] px-4 text-sm text-muted font-mono flex items-center border-r border-black/[0.08]">
            +91
          </span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
            className="w-full h-full px-4 text-base text-text bg-surface focus:outline-none"
          />
        </div>
        {errors.phone && (
          <p id="phone-error" role="alert" className="text-sm text-red-700">{errors.phone.message}</p>
        )}
      </div>

      {/* Row: Event Type & Guest Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Event Type */}
        <div className="space-y-1.5">
          <label htmlFor="event_type" className="block text-sm font-medium text-text">
            Event Type
          </label>
          <select
            id="event_type"
            aria-invalid={errors.event_type ? "true" : undefined}
            aria-describedby={errors.event_type ? "event-type-error" : undefined}
            {...register("event_type")}
            className="w-full h-12 px-3.5 rounded-lg border border-black/[0.12] text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          >
            <option value="wedding">Wedding</option>
            <option value="reception">Reception</option>
            <option value="engagement">Engagement</option>
            <option value="birthday">Birthday Party</option>
            <option value="other">Other Gathering</option>
          </select>
          {errors.event_type && (
            <p id="event-type-error" role="alert" className="text-sm text-red-700">{errors.event_type.message}</p>
          )}
        </div>

        {/* Guest Range */}
        <div className="space-y-1.5">
          <label htmlFor="guest_count" className="block text-sm font-medium text-text">
            Expected Guests
          </label>
          <select
            id="guest_count"
            aria-invalid={errors.guest_count ? "true" : undefined}
            aria-describedby={errors.guest_count ? "guest-count-error" : undefined}
            {...register("guest_count")}
            className="w-full h-12 px-3.5 rounded-lg border border-black/[0.12] text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          >
            <option value="under_200">Under 200</option>
            <option value="200_500">200 – 500</option>
            <option value="500_800">500 – 800</option>
            <option value="800_1200">800 – 1,200</option>
            <option value="above_1200">Above 1,200</option>
          </select>
          {errors.guest_count && (
            <p id="guest-count-error" role="alert" className="text-sm text-red-700">{errors.guest_count.message}</p>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="event_date" className="block text-sm font-medium text-text">
            Preferred Date
          </label>
          {currentDateValue && onClearSelectedDate && (
            <Button
              type="button"
              variant="text"
              size="sm"
              onClick={() => {
                setValue("event_date", "");
                onClearSelectedDate();
              }}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        <input
          id="event_date"
          type="date"
          aria-invalid={errors.event_date ? "true" : undefined}
          aria-describedby={errors.event_date ? "event-date-error" : undefined}
          {...register("event_date")}
          className={`w-full h-12 px-4 rounded-lg border text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            errors.event_date ? "border-red-400" : "border-black/[0.12]"
          }`}
        />
        {currentDateValue && (
          <p className="text-xs text-muted">
            Selected: {formatDisplayDate(currentDateValue)}
          </p>
        )}
        {errors.event_date && (
          <p id="event-date-error" role="alert" className="text-sm text-red-700">{errors.event_date.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-sm font-medium text-text">
          Message or Questions (Optional)
        </label>
        <textarea
          id="message"
          rows={3}
          maxLength={500}
          placeholder="Mention specific requirements like catering preference, rooms needed, etc."
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
          className="w-full p-4 rounded-lg border border-black/[0.12] text-sm text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 resize-none"
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-sm text-red-700">{errors.message.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={submitting}
          className="w-full justify-center !h-12"
        >
          {submitting ? "Submitting..." : "Send Enquiry"}
        </Button>
      </div>
    </form>
  );
};
