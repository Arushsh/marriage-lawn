"use client";

import React, { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/admin/api";
import {
  AdminButton,
  Banner,
  Field,
  PageHeader,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/ui";

/**
 * SiteSettings singleton editor — grouped like the Django admin fieldsets.
 * Image fields accept a file upload (multipart) or an http(s) URL.
 */

interface SiteSettings {
  venue_name: string;
  tagline: string;
  about_text: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  whatsapp_number: string;
  email: string;
  opening_hours: string;
  secondary_contact_name: string;
  secondary_phone: string;
  google_maps_url: string;
  google_reviews_url: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  rating_value: string | number;
  rating_count: number;
  weddings_hosted: number;
  events_hosted: number;
  years_of_experience: number;
  primary_color: string;
  accent_color: string;
  logo: string;
  hero_image: string;
  hero_video_url: string;
  menu_pdf: string;
  tour_enabled: boolean;
  meta_title: string;
  meta_description: string;
  notify_email: string;
}

function AssetInput({
  value,
  onChange,
  accept,
}: {
  value: string;
  onChange: (value: string, file: File | null) => void;
  accept: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  // Blob URL for a freshly chosen file; otherwise preview derives from value
  const [localPreview, setLocalPreview] = useState<string>("");
  const preview = localPreview || value;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <TextInput
          value={value}
          onChange={(e) => {
            setLocalPreview("");
            onChange(e.target.value, null);
          }}
          placeholder="https://… or upload a file"
        />
        <AdminButton variant="secondary" type="button" onClick={() => fileRef.current?.click()}>
          Upload
        </AdminButton>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onChange("", file);
              setLocalPreview(URL.createObjectURL(file));
            }
          }}
        />
      </div>
      {preview && accept.startsWith("image") && (
        // Plain <img> here: the preview may be a local blob URL next/image can't optimize
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="h-24 w-auto border border-border" />
      )}
      {preview && !accept.startsWith("image") && (
        <p className="text-xs text-muted truncate">Attached: {value || "(new file)"}</p>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [menuPdfFile, setMenuPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      adminFetch<SiteSettings>("/owner/site/")
        .then((data) => active && setSettings(data))
        .catch((err) => active && setError(err.message));
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = new FormData();
      // Everything except the three file assets goes in as strings
      const fileKeys = new Set(["logo", "hero_image", "menu_pdf"]);
      (Object.keys(settings) as Array<keyof SiteSettings>).forEach((key) => {
        if (fileKeys.has(key)) return;
        const value = settings[key];
        if (value === null || value === undefined) return;
        body.append(key, String(value));
      });
      if (logoFile) body.append("logo", logoFile);
      if (heroFile) body.append("hero_image", heroFile);
      if (menuPdfFile) body.append("menu_pdf", menuPdfFile);

      const updated = await adminFetch<SiteSettings>("/owner/site/", {
        method: "PATCH",
        body,
      });
      setSettings(updated);
      setLogoFile(null);
      setHeroFile(null);
      setMenuPdfFile(null);
      setSuccess("Site settings saved. The website updates within a minute (cached).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings && !error) {
    return (
      <div>
        <PageHeader title="Site Settings" />
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Venue identity, contact details, hero media, theme colours, and SEO. Changes appear on the public website after its short cache refresh."
      />

      {error && <Banner kind="error">{error}</Banner>}
      {success && <Banner kind="success">{success}</Banner>}

      <form onSubmit={handleSave} className="space-y-8 max-w-[820px]">
        <SettingsCard title="Identity">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Venue Name">
              <TextInput value={settings!.venue_name} onChange={(e) => set("venue_name", e.target.value)} required />
            </Field>
            <Field label="Tagline">
              <TextInput value={settings!.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
          </div>
          <Field label="About Text" hint="Shown in the About section and used for SEO.">
            <TextArea value={settings!.about_text} onChange={(e) => set("about_text", e.target.value)} rows={5} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City">
              <TextInput value={settings!.city} onChange={(e) => set("city", e.target.value)} required />
            </Field>
            <Field label="Opening Hours">
              <TextInput value={settings!.opening_hours} onChange={(e) => set("opening_hours", e.target.value)} />
            </Field>
          </div>
          <Field label="Address">
            <TextArea value={settings!.address} onChange={(e) => set("address", e.target.value)} rows={2} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Latitude">
              <TextInput
                type="number" step="any"
                value={settings!.latitude ?? ""}
                onChange={(e) => set("latitude", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="Longitude">
              <TextInput
                type="number" step="any"
                value={settings!.longitude ?? ""}
                onChange={(e) => set("longitude", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Contact">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <TextInput value={settings!.phone} onChange={(e) => set("phone", e.target.value)} required />
            </Field>
            <Field label="WhatsApp Number" hint="With country code, e.g. 919876543210">
              <TextInput value={settings!.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} required />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={settings!.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Lead Alert Email" hint="New enquiries notify this inbox.">
              <TextInput type="email" value={settings!.notify_email} onChange={(e) => set("notify_email", e.target.value)} />
            </Field>
            <Field label="Secondary Contact Name">
              <TextInput value={settings!.secondary_contact_name} onChange={(e) => set("secondary_contact_name", e.target.value)} />
            </Field>
            <Field label="Secondary Phone">
              <TextInput value={settings!.secondary_phone} onChange={(e) => set("secondary_phone", e.target.value)} />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Social Proof">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Rating (0–5)">
              <TextInput type="number" step="0.1" min="0" max="5" value={settings!.rating_value} onChange={(e) => set("rating_value", e.target.value)} />
            </Field>
            <Field label="Rating Count">
              <TextInput type="number" min="0" value={settings!.rating_count} onChange={(e) => set("rating_count", Number(e.target.value))} />
            </Field>
            <Field label="Weddings Hosted">
              <TextInput type="number" min="0" value={settings!.weddings_hosted} onChange={(e) => set("weddings_hosted", Number(e.target.value))} />
            </Field>
            <Field label="Events Hosted">
              <TextInput type="number" min="0" value={settings!.events_hosted} onChange={(e) => set("events_hosted", Number(e.target.value))} />
            </Field>
            <Field label="Years of Experience">
              <TextInput type="number" min="0" value={settings!.years_of_experience} onChange={(e) => set("years_of_experience", Number(e.target.value))} />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Links">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Google Maps URL">
              <TextInput value={settings!.google_maps_url} onChange={(e) => set("google_maps_url", e.target.value)} />
            </Field>
            <Field label="Google Reviews URL">
              <TextInput value={settings!.google_reviews_url} onChange={(e) => set("google_reviews_url", e.target.value)} />
            </Field>
            <Field label="Instagram URL">
              <TextInput value={settings!.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} />
            </Field>
            <Field label="Facebook URL">
              <TextInput value={settings!.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} />
            </Field>
            <Field label="YouTube URL">
              <TextInput value={settings!.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Branding & Hero Media">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Primary Colour" hint="Hex, e.g. #6B1426">
              <TextInput value={settings!.primary_color} onChange={(e) => set("primary_color", e.target.value)} />
            </Field>
            <Field label="Accent Colour" hint="Hex, e.g. #B8860B">
              <TextInput value={settings!.accent_color} onChange={(e) => set("accent_color", e.target.value)} />
            </Field>
          </div>
          <Field label="Logo">
            <AssetInput
              accept="image/*"
              value={settings!.logo}
              onChange={(value, file) => {
                if (file) { setLogoFile(file); } else { set("logo", value); setLogoFile(null); }
              }}
            />
          </Field>
          <Field label="Hero Image">
            <AssetInput
              accept="image/*"
              value={settings!.hero_image}
              onChange={(value, file) => {
                if (file) { setHeroFile(file); } else { set("hero_image", value); setHeroFile(null); }
              }}
            />
          </Field>
          <Field label="Hero Video URL">
            <TextInput value={settings!.hero_video_url} onChange={(e) => set("hero_video_url", e.target.value)} />
          </Field>
          <Field label="Menu PDF">
            <AssetInput
              accept="application/pdf"
              value={settings!.menu_pdf}
              onChange={(value, file) => {
                if (file) { setMenuPdfFile(file); } else { set("menu_pdf", value); setMenuPdfFile(null); }
              }}
            />
          </Field>
          <Toggle
            checked={settings!.tour_enabled}
            onChange={(v) => set("tour_enabled", v)}
            label="Show the 360° tour section"
          />
        </SettingsCard>

        <SettingsCard title="SEO">
          <Field label="Meta Title" hint="Up to 70 characters.">
            <TextInput value={settings!.meta_title} onChange={(e) => set("meta_title", e.target.value)} maxLength={70} />
          </Field>
          <Field label="Meta Description" hint="Up to 160 characters.">
            <TextArea value={settings!.meta_description} onChange={(e) => set("meta_description", e.target.value)} rows={3} maxLength={160} />
          </Field>
        </SettingsCard>

        <div className="flex items-center gap-3 pb-6">
          <AdminButton type="submit" loading={saving} className="!h-12 px-8">
            Save Settings
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-border">
      <h2 className="px-5 sm:px-6 py-3.5 border-b border-border bg-surface font-serif text-lg text-primary font-normal">
        {title}
      </h2>
      <div className="p-5 sm:p-6 space-y-4">{children}</div>
    </section>
  );
}
