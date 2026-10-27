"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminFetch, adminList } from "@/lib/admin/api";
import {
  AdminButton,
  Banner,
  EmptyState,
  Field,
  PageHeader,
  TextInput,
} from "@/components/admin/ui";

interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
}

interface MenuItem {
  id: number;
  category: number;
  name: string;
  description: string;
  image: string;
  is_veg: boolean;
  is_popular: boolean;
  order: number;
  is_visible: boolean;
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, allItems] = await Promise.all([
        adminList<MenuCategory>("/owner/menu-categories/"),
        adminList<MenuItem>("/owner/menu-items/"),
      ]);
      setCategories(cats);
      setItems(allItems);
      setActiveCategory((prev) => prev ?? cats[0]?.id ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    try {
      await adminFetch("/owner/menu-categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          slug: data.get("slug"),
          description: data.get("description") || "",
        }),
      });
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category.");
    }
  };

  const handleSaveItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeCategory == null) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    try {
      await adminFetch("/owner/menu-items/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeCategory,
          name: data.get("name"),
          description: data.get("description") || "",
          is_veg: data.get("is_veg") === "on",
          is_popular: data.get("is_popular") === "on",
        }),
      });
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add dish.");
    }
  };

  const patchItem = async (id: number, payload: Partial<MenuItem>) => {
    setError(null);
    try {
      await adminFetch(`/owner/menu-items/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("Delete this dish?")) return;
    try {
      await adminFetch(`/owner/menu-items/${id}/`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const deleteCategory = async (id: number) => {
    if (!window.confirm("Delete this category and ALL its dishes?")) return;
    try {
      await adminFetch(`/owner/menu-categories/${id}/`, { method: "DELETE" });
      setActiveCategory(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const visibleItems = items.filter(
    (item) => activeCategory == null || item.category === activeCategory
  );

  if (loading) {
    return (
      <div>
        <PageHeader title="Menu" />
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Menu"
        subtitle="Catering categories and dishes shown on the menu page. Hidden dishes stay saved but leave the website."
      />
      {error && <Banner kind="error">{error}</Banner>}

      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Categories */}
        <div className="space-y-4">
          <div className="bg-white border border-border">
            <h2 className="px-4 py-3 border-b border-border bg-surface text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Categories
            </h2>
            <ul className="divide-y divide-border">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <div
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 cursor-pointer ${
                      activeCategory === cat.id ? "bg-surface border-l-2 border-l-accent" : "hover:bg-surface/60"
                    }`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="text-sm text-text">{cat.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{items.filter((i) => i.category === cat.id).length}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat.id);
                        }}
                        className="text-[10px] uppercase text-red-700 hover:underline"
                        aria-label={`Delete ${cat.name}`}
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="px-4 py-4 text-sm text-muted">No categories yet.</li>
              )}
            </ul>
          </div>

          <form onSubmit={handleAddCategory} className="bg-white border border-border p-4 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Add Category</h3>
            <TextInput name="name" placeholder="Name (e.g. Starters)" required />
            <TextInput name="slug" placeholder="slug (e.g. starters)" required pattern="[a-z0-9-]+" />
            <AdminButton type="submit" variant="secondary" className="w-full">Add Category</AdminButton>
          </form>
        </div>

        {/* Items */}
        <div className="space-y-5">
          {activeCategory != null && (
            <form
              onSubmit={handleSaveItem}
              className="bg-white border border-border p-5 space-y-4"
            >
              <h2 className="font-serif text-lg text-primary font-normal">Add Dish</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Dish Name">
                  <TextInput name="name" required placeholder="Paneer Tikka Angara" />
                </Field>
                <Field label="Description">
                  <TextInput name="description" placeholder="Charcoal-gratted cottage cheese" />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-6 pb-1">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="is_veg" defaultChecked className="w-4 h-4 accent-[#6B1426]" />
                  Vegetarian
                </label>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="is_popular" className="w-4 h-4 accent-[#6B1426]" />
                  Mark as popular
                </label>
              </div>
              <AdminButton type="submit">Add Dish</AdminButton>
            </form>
          )}

          {visibleItems.length === 0 ? (
            <EmptyState message="No dishes in this category yet." />
          ) : (
            <ul className="divide-y divide-border border border-border bg-white">
              {visibleItems.map((item) => (
                <li key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <TextInput
                        defaultValue={item.name}
                        className="!py-1.5 font-medium"
                        onBlur={(e) => e.target.value !== item.name && patchItem(item.id, { name: e.target.value })}
                      />
                      <TextInput
                        defaultValue={item.description}
                        placeholder="Description"
                        className="!py-1.5 !text-xs"
                        onBlur={(e) =>
                          e.target.value !== item.description && patchItem(item.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="text-[10px] uppercase tracking-wider text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.is_veg}
                        onChange={(e) => patchItem(item.id, { is_veg: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#6B1426]"
                      />
                      Veg
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.is_popular}
                        onChange={(e) => patchItem(item.id, { is_popular: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#6B1426]"
                      />
                      Popular
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.is_visible}
                        onChange={(e) => patchItem(item.id, { is_visible: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#6B1426]"
                      />
                      Visible on site
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
