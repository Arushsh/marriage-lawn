"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminFetch, adminList } from "@/lib/admin/api";
import {
  AdminButton,
  Banner,
  EmptyState,
  Field,
  PageHeader,
  Select,
  TextArea,
  TextInput,
} from "@/components/admin/ui";

type Tab = "halls" | "facilities" | "reviews" | "faqs";

interface Hall {
  id: number;
  name: string;
  description: string;
  seating_capacity: number;
  floating_capacity: number;
  is_ac: boolean;
  image: string;
  order: number;
}

interface Facility {
  id: number;
  name: string;
  icon: string;
  detail: string;
  order: number;
}

interface Review {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  source: string;
  date: string;
  is_visible: boolean;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

const TABS: Array<[Tab, string]> = [
  ["halls", "Halls & Lawns"],
  ["facilities", "Facilities"],
  ["reviews", "Reviews"],
  ["faqs", "FAQs"],
];

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("halls");

  return (
    <div>
      <PageHeader
        title="Venue Content"
        subtitle="Halls, facility highlights, customer reviews, and FAQs shown across the website."
        actions={
          <div className="flex flex-wrap border border-border bg-white">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-3.5 h-10 text-xs uppercase tracking-[0.1em] font-semibold whitespace-nowrap ${
                  tab === key ? "bg-primary text-white" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />
      {tab === "halls" && <HallsTab />}
      {tab === "facilities" && <FacilitiesTab />}
      {tab === "reviews" && <ReviewsTab />}
      {tab === "faqs" && <FAQsTab />}
    </div>
  );
}

// ─── Halls ────────────────────────────────────────────────────────────────────

function HallsTab() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHalls(await adminList<Hall>("/owner/halls/"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load halls.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const patch = async (id: number, payload: Partial<Hall>) => {
    try {
      await adminFetch(`/owner/halls/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setHalls((prev) => prev.map((h) => (h.id === id ? { ...h, ...payload } : h)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="space-y-4 max-w-[820px]">
      {error && <Banner kind="error">{error}</Banner>}
      {halls.length === 0 ? (
        <EmptyState message="No halls defined. Create them in Django admin or via seed data." />
      ) : (
        halls.map((hall) => (
          <section key={hall.id} className="bg-white border border-border p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <TextInput
                  defaultValue={hall.name}
                  onBlur={(e) => e.target.value !== hall.name && patch(hall.id, { name: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <TextInput
                  defaultValue={hall.description}
                  onBlur={(e) => e.target.value !== hall.description && patch(hall.id, { description: e.target.value })}
                />
              </Field>
              <Field label="Seating Capacity">
                <TextInput
                  type="number" min="0" defaultValue={hall.seating_capacity}
                  onBlur={(e) => Number(e.target.value) !== hall.seating_capacity && patch(hall.id, { seating_capacity: Number(e.target.value) })}
                />
              </Field>
              <Field label="Floating Capacity">
                <TextInput
                  type="number" min="0" defaultValue={hall.floating_capacity}
                  onBlur={(e) => Number(e.target.value) !== hall.floating_capacity && patch(hall.id, { floating_capacity: Number(e.target.value) })}
                />
              </Field>
            </div>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hall.is_ac}
                onChange={(e) => patch(hall.id, { is_ac: e.target.checked })}
                className="w-4 h-4 accent-[#6B1426]"
              />
              Air conditioned
            </label>
          </section>
        ))
      )}
    </div>
  );
}

// ─── Facilities ───────────────────────────────────────────────────────────────

function FacilitiesTab() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFacilities(await adminList<Facility>("/owner/facilities/"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load facilities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await adminFetch("/owner/facilities/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          icon: data.get("icon") || "sparkles",
          detail: data.get("detail") || "",
        }),
      });
      (event.target as HTMLFormElement).reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add facility.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this facility?")) return;
    try {
      await adminFetch(`/owner/facilities/${id}/`, { method: "DELETE" });
      setFacilities((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="space-y-5 max-w-[720px]">
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleAdd} className="bg-white border border-border p-5 grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
        <Field label="Name"><TextInput name="name" required placeholder="Valet Parking" /></Field>
        <Field label="Icon Key" hint="Lucide name, e.g. car"><TextInput name="icon" placeholder="car" /></Field>
        <Field label="Detail"><TextInput name="detail" placeholder="100 cars" /></Field>
        <AdminButton type="submit">Add</AdminButton>
      </form>
      {facilities.length === 0 ? (
        <EmptyState message="No facilities listed yet." />
      ) : (
        <ul className="divide-y divide-border border border-border bg-white">
          {facilities.map((facility) => (
            <li key={facility.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm text-text font-medium">{facility.name}</p>
                <p className="text-xs text-muted">{facility.detail || `icon: ${facility.icon}`}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(facility.id)}
                className="text-[10px] uppercase tracking-wider text-red-700 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await adminList<Review>("/owner/reviews/"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await adminFetch("/owner/reviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: data.get("author_name"),
          rating: Number(data.get("rating")),
          text: data.get("text"),
          source: data.get("source"),
          date: data.get("date"),
        }),
      });
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add review.");
    }
  };

  const patch = async (id: number, payload: Partial<Review>) => {
    try {
      await adminFetch(`/owner/reviews/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } : r)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await adminFetch(`/owner/reviews/${id}/`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="space-y-5 max-w-[820px]">
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleAdd} className="bg-white border border-border p-5 space-y-4">
        <h2 className="font-serif text-lg text-primary font-normal">Add Review</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <Field label="Author"><TextInput name="author_name" required /></Field>
          <Field label="Rating">
            <Select name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </Select>
          </Field>
          <Field label="Source">
            <Select name="source" defaultValue="google">
              <option value="google">Google</option>
              <option value="justdial">Justdial</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Date"><TextInput name="date" type="date" required /></Field>
        </div>
        <Field label="Review Text"><TextArea name="text" rows={3} required /></Field>
        <AdminButton type="submit">Add Review</AdminButton>
      </form>

      {reviews.length === 0 ? (
        <EmptyState message="No reviews yet." />
      ) : (
        <ul className="divide-y divide-border border border-border bg-white">
          {reviews.map((review) => (
            <li key={review.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-text font-medium">
                  {review.author_name} <span className="text-accent">{"★".repeat(review.rating)}</span>
                  <span className="text-xs text-muted font-normal"> · {review.date} · {review.source}</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(review.id)}
                  className="text-[10px] uppercase tracking-wider text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
              <TextArea
                defaultValue={review.text}
                rows={2}
                onBlur={(e) => e.target.value !== review.text && patch(review.id, { text: e.target.value })}
              />
              <label className="inline-flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={review.is_visible}
                  onChange={(e) => patch(review.id, { is_visible: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#6B1426]"
                />
                Visible on site
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

function FAQsTab() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFaqs(await adminList<FAQ>("/owner/faqs/"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await adminFetch("/owner/faqs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: data.get("question"),
          answer: data.get("answer"),
          order: Number(data.get("order") || 0),
        }),
      });
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add FAQ.");
    }
  };

  const patch = async (id: number, payload: Partial<FAQ>) => {
    try {
      await adminFetch(`/owner/faqs/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...payload } : f)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await adminFetch(`/owner/faqs/${id}/`, { method: "DELETE" });
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="space-y-5 max-w-[820px]">
      {error && <Banner kind="error">{error}</Banner>}
      <form onSubmit={handleAdd} className="bg-white border border-border p-5 space-y-4">
        <h2 className="font-serif text-lg text-primary font-normal">Add FAQ</h2>
        <Field label="Question"><TextInput name="question" required /></Field>
        <Field label="Answer"><TextArea name="answer" rows={3} required /></Field>
        <div className="flex items-end gap-3">
          <Field label="Order" className="w-28"><TextInput name="order" type="number" min="0" defaultValue={0} /></Field>
          <AdminButton type="submit">Add FAQ</AdminButton>
        </div>
      </form>

      {faqs.length === 0 ? (
        <EmptyState message="No FAQs yet." />
      ) : (
        <ul className="divide-y divide-border border border-border bg-white">
          {faqs.map((faq) => (
            <li key={faq.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <TextInput
                  defaultValue={faq.question}
                  className="!py-1.5 font-medium"
                  onBlur={(e) => e.target.value !== faq.question && patch(faq.id, { question: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => handleDelete(faq.id)}
                  className="text-[10px] uppercase tracking-wider text-red-700 hover:underline shrink-0 pt-2"
                >
                  Delete
                </button>
              </div>
              <TextArea
                defaultValue={faq.answer}
                rows={2}
                onBlur={(e) => e.target.value !== faq.answer && patch(faq.id, { answer: e.target.value })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Loading() {
  return <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>;
}
