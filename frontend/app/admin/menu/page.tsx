"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Utensils, Plus, Trash2, Check, Star, Eye, EyeOff } from "lucide-react";
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

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Catering Menu Management" subtitle="Manage royal food categories and banqueting dishes." />
        <div className="h-64 bg-stone-200/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Royal Catering Menu"
        subtitle="Manage food courses, wedding banquet spreads, and specialty dishes presented on the website."
      />

      {error && <Banner kind="error">{error}</Banner>}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Categories Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                Menu Courses
              </h2>
              <span className="text-xs font-medium text-stone-400">
                {categories.length} total
              </span>
            </div>

            <ul className="divide-y divide-stone-100">
              {categories.map((cat) => {
                const count = items.filter((i) => i.category === cat.id).length;
                const isActive = activeCategory === cat.id;
                return (
                  <li key={cat.id}>
                    <div
                      className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-all duration-150 ${
                        isActive
                          ? "bg-[#7A1528]/10 border-l-4 border-l-[#7A1528] text-stone-900 font-semibold"
                          : "hover:bg-stone-50 text-stone-700 border-l-4 border-l-transparent"
                      }`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm truncate">{cat.name}</p>
                        <p className="text-[11px] text-stone-400 font-mono font-normal">/{cat.slug}</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium font-mono">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(cat.id);
                          }}
                          className="text-stone-300 hover:text-rose-600 p-1 rounded transition-colors"
                          title={`Delete ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
              {categories.length === 0 && (
                <li className="p-6 text-center text-sm text-stone-400">No categories created yet.</li>
              )}
            </ul>
          </div>

          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 text-stone-800">
              <Plus className="w-4 h-4 text-[#C5A880]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                New Course Category
              </h3>
            </div>
            <TextInput name="name" placeholder="Name (e.g. Royal Starters)" required />
            <TextInput
              name="slug"
              placeholder="Slug (e.g. royal-starters)"
              required
              pattern="[a-z0-9-]+"
            />
            <AdminButton type="submit" variant="secondary" className="w-full">
              Add Category
            </AdminButton>
          </form>
        </div>

        {/* Dishes Column */}
        <div className="space-y-6">
          {activeCategory != null && (
            <form
              onSubmit={handleSaveItem}
              className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-base font-semibold text-stone-900">
                    Add Dish to {activeCategoryObj?.name || "Selected Category"}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Introduce a new catering specialty or beverage item
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#C5A880]/15 text-[#8F6A35]">
                  Active Section
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Dish Name *">
                  <TextInput name="name" required placeholder="e.g. Paneer Tikka Angara" />
                </Field>
                <Field label="Description & Ingredients">
                  <TextInput
                    name="description"
                    placeholder="e.g. Charcoal-grilled cottage cheese with royal Awadhi spices"
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="is_veg"
                    defaultChecked
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  Pure Vegetarian
                </label>
                <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="is_popular"
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  Mark as Chef's Special / Popular
                </label>
              </div>

              <div className="pt-2">
                <AdminButton type="submit">Add Dish to Menu</AdminButton>
              </div>
            </form>
          )}

          {/* Dish List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-600">
                Dishes in {activeCategoryObj?.name || "Category"} ({visibleItems.length})
              </h2>
            </div>

            {visibleItems.length === 0 ? (
              <EmptyState message="No dishes in this category yet. Use the form above to add your first dish." />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-xs hover:border-[#C5A880]/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2 min-w-0 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TextInput
                          defaultValue={item.name}
                          className="!py-1.5 !text-sm !font-semibold !text-stone-900 !max-w-xs"
                          onBlur={(e) =>
                            e.target.value !== item.name &&
                            patchItem(item.id, { name: e.target.value })
                          }
                        />
                        {item.is_veg && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Veg
                          </span>
                        )}
                        {item.is_popular && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Special
                          </span>
                        )}
                        {!item.is_visible && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500">
                            Hidden
                          </span>
                        )}
                      </div>
                      <TextInput
                        defaultValue={item.description}
                        placeholder="Dish description"
                        className="!py-1 !text-xs !text-stone-600 w-full"
                        onBlur={(e) =>
                          e.target.value !== item.description &&
                          patchItem(item.id, { description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => patchItem(item.id, { is_visible: !item.is_visible })}
                        className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                          item.is_visible
                            ? "border-stone-200 text-stone-600 hover:bg-stone-50"
                            : "border-stone-200 bg-stone-100 text-stone-400"
                        }`}
                        title={item.is_visible ? "Hide from website" : "Show on website"}
                      >
                        {item.is_visible ? (
                          <Eye className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-stone-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
