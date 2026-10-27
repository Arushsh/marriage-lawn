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
  Toggle,
} from "@/components/admin/ui";

interface InclusionGroup {
  title: string;
  items: string[];
}

interface PackageRow {
  id: number;
  name: string;
  description: string;
  price_from: string | null;
  price_unit: "per_event" | "per_plate";
  min_guests: number | null;
  max_guests: number | null;
  price_note: string;
  inclusions: string[] | InclusionGroup[];
  is_popular: boolean;
  show_price: boolean;
  order: number;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PackageRow | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPackages(await adminList<PackageRow>("/owner/packages/"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this package?")) return;
    try {
      await adminFetch(`/owner/packages/${id}/`, { method: "DELETE" });
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const handleTogglePopular = async (pkg: PackageRow) => {
    setError(null);
    try {
      await adminFetch(`/owner/packages/${pkg.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_popular: !pkg.is_popular }),
      });
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_popular: !p.is_popular } : p))
      );
      setNotice("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Packages" />
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Packages"
        subtitle="Pricing tiers shown on the packages page and in the booking flow."
        actions={<AdminButton onClick={() => setCreating(true)}>New Package</AdminButton>}
      />

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}

      {(creating || editing) && (
        <PackageForm
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await load();
          }}
        />
      )}

      {packages.length === 0 ? (
        <EmptyState message="No packages yet — create your first one." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <article key={pkg.id} className="bg-white border border-border p-5 space-y-3 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-stone-900 tracking-tight">{pkg.name}</h2>
                {pkg.is_popular && (
                  <span className="text-[10px] font-semibold text-[#8F6A35] bg-[#C5A880]/15 px-2 py-0.5 rounded-full border border-[#C5A880]/30">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-muted line-clamp-2">{pkg.description || "No description."}</p>
              <p className="font-serif text-2xl text-text">
                {pkg.show_price && pkg.price_from
                  ? `₹${Number(pkg.price_from).toLocaleString("en-IN")}`
                  : "Custom Quote"}
                <span className="text-xs text-muted font-sans"> / {pkg.price_unit.replace("_", " ")}</span>
              </p>
              <p className="text-[11px] text-muted">
                {Array.isArray(pkg.inclusions) ? pkg.inclusions.length : 0} inclusions · order #{pkg.order}
              </p>
              <div className="pt-3 mt-auto border-t border-border flex flex-wrap items-center gap-2">
                <AdminButton variant="secondary" onClick={() => setEditing(pkg)}>
                  Edit
                </AdminButton>
                <AdminButton variant="ghost" onClick={() => handleTogglePopular(pkg)}>
                  {pkg.is_popular ? "Unmark popular" : "Mark popular"}
                </AdminButton>
                <AdminButton variant="danger" onClick={() => handleDelete(pkg.id)} className="ml-auto">
                  Delete
                </AdminButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PackageForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: PackageRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [inclusionText, setInclusionText] = useState(() =>
    Array.isArray(initial?.inclusions)
      ? initial!.inclusions
          .map((entry) => (typeof entry === "string" ? entry : `${entry.title}: ${entry.items.join(", ")}`))
          .join("\n")
      : ""
  );
  const [showPrice, setShowPrice] = useState(initial?.show_price ?? true);
  const [isPopular, setIsPopular] = useState(initial?.is_popular ?? false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      // One inclusion per line; "Title: a, b" becomes a group, plain lines stay strings
      const inclusions = inclusionText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const match = line.match(/^([^:]{1,60}):\s*(.+)$/);
          if (match) {
            return {
              title: match[1].trim(),
              items: match[2].split(",").map((s) => s.trim()).filter(Boolean),
            };
          }
          return line;
        });

      const payload = {
        name: data.get("name"),
        description: data.get("description") || "",
        price_from: data.get("price_from") ? Number(data.get("price_from")) : null,
        price_unit: data.get("price_unit"),
        min_guests: data.get("min_guests") ? Number(data.get("min_guests")) : null,
        max_guests: data.get("max_guests") ? Number(data.get("max_guests")) : null,
        price_note: data.get("price_note") || "",
        inclusions,
        is_popular: isPopular,
        show_price: showPrice,
        order: data.get("order") ? Number(data.get("order")) : 0,
      };

      if (initial) {
        await adminFetch(`/owner/packages/${initial.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/owner/packages/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-accent p-5 sm:p-6 space-y-4 max-w-[760px] mb-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-stone-900 font-semibold">
          {initial ? `Edit: ${initial.name}` : "New Package"}
        </h2>
        <button type="button" onClick={onClose} className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900">
          Cancel
        </button>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <TextInput name="name" defaultValue={initial?.name} required />
        </Field>
        <Field label="Price (₹)" hint="Leave empty for a custom quote.">
          <TextInput name="price_from" type="number" step="0.01" min="0" defaultValue={initial?.price_from ?? ""} />
        </Field>
      </div>

      <Field label="Description">
        <TextArea name="description" defaultValue={initial?.description} rows={3} />
      </Field>

      <div className="grid sm:grid-cols-4 gap-4">
        <Field label="Price Unit">
          <Select name="price_unit" defaultValue={initial?.price_unit ?? "per_event"}>
            <option value="per_event">Per Event</option>
            <option value="per_plate">Per Plate</option>
          </Select>
        </Field>
        <Field label="Min Guests">
          <TextInput name="min_guests" type="number" min="0" defaultValue={initial?.min_guests ?? ""} />
        </Field>
        <Field label="Max Guests">
          <TextInput name="max_guests" type="number" min="0" defaultValue={initial?.max_guests ?? ""} />
        </Field>
        <Field label="Display Order">
          <TextInput name="order" type="number" min="0" defaultValue={initial?.order ?? 0} />
        </Field>
      </div>

      <Field label="Price Note">
        <TextInput name="price_note" defaultValue={initial?.price_note} placeholder="per event · varies by date and guest count" />
      </Field>

      <Field
        label="Inclusions"
        hint="One per line. Use 'Group title: item, item' for grouped sections."
      >
        <TextArea
          value={inclusionText}
          onChange={(e) => setInclusionText(e.target.value)}
          rows={6}
          placeholder={"Main lawn (up to 500 guests)\nDecor: Flowers, Lighting, Stage"}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-6">
        <Toggle checked={showPrice} onChange={setShowPrice} label="Show price publicly" />
        <Toggle checked={isPopular} onChange={setIsPopular} label="Mark as most popular" />
      </div>

      <AdminButton type="submit" loading={saving} className="!h-12 px-8">
        {initial ? "Save Changes" : "Create Package"}
      </AdminButton>
    </form>
  );
}
