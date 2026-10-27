"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, adminList } from "@/lib/admin/api";
import {
  AdminButton,
  Banner,
  EmptyState,
  Field,
  PageHeader,
  Select,
  TextInput,
} from "@/components/admin/ui";

interface GalleryImage {
  id: number;
  image: string;
  category: string;
  caption: string;
  alt_text: string;
  is_featured: boolean;
  order: number;
}

interface VideoLink {
  id: number;
  title: string;
  url: string;
  order: number;
}

const CATEGORIES = [
  ["lawn", "Lawn"],
  ["mandap", "Mandap"],
  ["dining", "Dining"],
  ["rooms", "Rooms"],
  ["decor", "Decor"],
  ["night", "Night"],
  ["other", "Other"],
] as const;

export default function AdminGalleryPage() {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Photos and videos shown in the public gallery and homepage preview."
        actions={
          <div className="flex border border-border bg-white">
            {(["photos", "videos"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-4 h-10 text-xs uppercase tracking-[0.12em] font-semibold capitalize ${
                  tab === key ? "bg-primary text-white" : "text-muted hover:text-text"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        }
      />
      {tab === "photos" ? <PhotosTab /> : <VideosTab />}
    </div>
  );
}

function PhotosTab() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminList<GalleryImage>(
        `/owner/gallery/${categoryFilter ? `?category=${categoryFilter}` : ""}`
      );
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image") as File | null;
    if (!file || file.size === 0) {
      setError("Choose an image file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      await adminFetch("/owner/gallery/", { method: "POST", body: form });
      setNotice("Photo uploaded.");
      setShowUpload(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handlePatch = async (id: number, payload: Partial<GalleryImage>) => {
    setError(null);
    try {
      await adminFetch(`/owner/gallery/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...payload } : img)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this photo permanently?")) return;
    try {
      await adminFetch(`/owner/gallery/${id}/`, { method: "DELETE" });
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <div className="space-y-5">
      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="!w-48"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <AdminButton variant="primary" onClick={() => setShowUpload((v) => !v)}>
          {showUpload ? "Close" : "Upload Photos"}
        </AdminButton>
        <span className="text-xs text-muted">{images.length} photos</span>
      </div>

      {showUpload && (
        <form
          onSubmit={handleUpload}
          className="bg-white border border-border p-5 sm:p-6 space-y-4 max-w-[620px]"
        >
          <Field label="Image File">
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              required
              className="w-full text-sm text-muted file:mr-3 file:px-3 file:py-2 file:border file:border-accent file:bg-surface file:text-primary file:text-xs file:uppercase file:tracking-wider file:cursor-pointer"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category">
              <Select name="category" defaultValue="other">
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Caption">
              <TextInput name="caption" placeholder="e.g. Grand lawn at dusk" />
            </Field>
          </div>
          <Field label="Alt Text" hint="Describe the photo for screen readers and SEO.">
            <TextInput name="alt_text" placeholder="Illuminated lawn with round guest tables" />
          </Field>
          <label className="inline-flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" name="is_featured" value="true" className="w-4 h-4 accent-[#6B1426]" />
            Featured (shows in homepage preview)
          </label>
          <div>
            <AdminButton type="submit" loading={uploading}>
              Upload
            </AdminButton>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      ) : images.length === 0 ? (
        <EmptyState message="No photos in this category yet." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img) => (
            <figure key={img.id} className="border border-border bg-white">
              {/* Admin thumbnails: remote/blob URLs of arbitrary ratio, plain img is appropriate here */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image}
                alt={img.alt_text || img.caption}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              <figcaption className="p-3 space-y-2">
                <TextInput
                  defaultValue={img.caption}
                  placeholder="Caption"
                  className="!py-1.5 !text-xs"
                  onBlur={(e) => {
                    if (e.target.value !== img.caption) handlePatch(img.id, { caption: e.target.value });
                  }}
                />
                <div className="flex items-center justify-between gap-2">
                  <Select
                    value={img.category}
                    onChange={(e) => handlePatch(img.id, { category: e.target.value })}
                    className="!py-1.5 !text-xs flex-1"
                    aria-label="Category"
                  >
                    {CATEGORIES.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                  <label className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={img.is_featured}
                      onChange={(e) => handlePatch(img.id, { is_featured: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#6B1426]"
                    />
                    Featured
                  </label>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[10px] text-muted">#{img.order}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="text-[10px] uppercase tracking-wider text-red-700 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function VideosTab() {
  const [videos, setVideos] = useState<VideoLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVideos(await adminList<VideoLink>("/owner/videos/"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminFetch("/owner/videos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      setTitle("");
      setUrl("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this video?")) return;
    try {
      await adminFetch(`/owner/videos/${id}/`, { method: "DELETE" });
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <div className="space-y-5 max-w-[720px]">
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleAdd} className="bg-white border border-border p-5 sm:p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Cinematic walkthrough" />
          </Field>
          <Field label="Video URL" hint="YouTube, Vimeo, or Cloudinary link.">
            <TextInput value={url} onChange={(e) => setUrl(e.target.value)} required type="url" placeholder="https://…" />
          </Field>
        </div>
        <AdminButton type="submit" loading={saving}>Add Video</AdminButton>
      </form>

      {loading ? (
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      ) : videos.length === 0 ? (
        <EmptyState message="No videos yet." />
      ) : (
        <ul className="divide-y divide-border border border-border bg-white">
          {videos.map((video) => (
            <li key={video.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm text-text font-medium truncate">{video.title}</p>
                <p className="text-xs text-muted truncate">{video.url}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(video.id)}
                className="text-[10px] uppercase tracking-wider text-red-700 hover:underline cursor-pointer whitespace-nowrap"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
