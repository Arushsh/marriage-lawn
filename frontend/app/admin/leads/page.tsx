"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminFetch, adminList } from "@/lib/admin/api";
import {
  Banner,
  EmptyState,
  PageHeader,
  Select,
  TableShell,
  TextArea,
  TextInput,
} from "@/components/admin/ui";
import { StatusPill } from "@/app/admin/page";

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  package_name: string;
  event_date: string | null;
  guest_count: string;
  message: string;
  status: "new" | "contacted" | "visited" | "booked" | "lost";
  source: string;
  owner_note: string;
  created_at: string;
}

const STATUSES = ["new", "contacted", "visited", "booked", "lost"] as const;

export default function AdminLeadsPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const query = params.toString();
      setEnquiries(await adminList<Enquiry>(`/owner/enquiries/${query ? `?${query}` : ""}`));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0); // debounce search
    return () => clearTimeout(timer);
  }, [load, search]);

  const handleUpdate = async (id: number, payload: Partial<Enquiry>) => {
    setError(null);
    try {
      const updated = await adminFetch<Enquiry>(`/owner/enquiries/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEnquiries((prev) => prev.map((row) => (row.id === id ? { ...row, ...updated } : row)));
      setNotice("Lead updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Every enquiry from the website contact form, calendar, and AI callbacks."
      />

      {error && <Banner kind="error">{error}</Banner>}
      {notice && <Banner kind="success">{notice}</Banner>}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or phone…"
          className="!w-64"
          aria-label="Search leads"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="!w-44"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </Select>
        <span className="text-xs text-muted">{enquiries.length} leads</span>
      </div>

      {loading ? (
        <p className="text-sm text-muted font-mono uppercase tracking-[0.2em]">Loading…</p>
      ) : enquiries.length === 0 ? (
        <EmptyState message="No leads match. New enquiries appear here the moment visitors submit the form." />
      ) : (
        <TableShell headers={["Received", "Name", "Phone", "Event", "Package", "Status", ""]}>
          {enquiries.map((enquiry) => (
            <React.Fragment key={enquiry.id}>
              <tr
                className="cursor-pointer hover:bg-stone-100/70 transition-colors"
                onClick={() => setExpandedId(expandedId === enquiry.id ? null : enquiry.id)}
              >
                <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">
                  {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short",
                  })}
                </td>
                <td className="px-4 py-2.5 text-text font-medium">{enquiry.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  <a href={`tel:+91${enquiry.phone}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                    {enquiry.phone}
                  </a>
                </td>
                <td className="px-4 py-2.5 capitalize text-muted">
                  {enquiry.event_type}
                  {enquiry.event_date ? ` · ${enquiry.event_date}` : ""}
                </td>
                <td className="px-4 py-2.5 text-muted text-xs">{enquiry.package_name || "—"}</td>
                <td className="px-4 py-2.5">
                  <StatusPill status={enquiry.status} />
                </td>
                <td className="px-4 py-2.5 text-right text-muted">
                  {expandedId === enquiry.id ? "▲" : "▼"}
                </td>
              </tr>
              {expandedId === enquiry.id && (
                <tr className="bg-stone-50 border-y border-stone-200">
                  <td colSpan={7} className="px-4 py-4">
                    <LeadDetail enquiry={enquiry} onUpdate={handleUpdate} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </TableShell>
      )}
    </div>
  );
}

function LeadDetail({
  enquiry,
  onUpdate,
}: {
  enquiry: Enquiry;
  onUpdate: (id: number, payload: Partial<Enquiry>) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="space-y-2 text-sm">
        <p><span className="text-muted text-xs uppercase tracking-wider block">Message</span></p>
        <p className="text-text whitespace-pre-wrap">{enquiry.message || "No message left."}</p>
        <p className="text-xs text-muted pt-2">
          Guest band: {enquiry.guest_count || "—"} · Source: {enquiry.source} · Email: {enquiry.email || "—"}
        </p>
        <div className="flex gap-2 pt-2">
          <a
            href={`https://wa.me/91${enquiry.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wider text-green-800 hover:underline"
          >
            WhatsApp ↗
          </a>
        </div>
      </div>
      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted block">
            Pipeline Status
          </span>
          <Select
            value={enquiry.status}
            onChange={(e) => onUpdate(enquiry.id, { status: e.target.value as Enquiry["status"] })}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted block">
            Private Note
          </span>
          <TextArea
            defaultValue={enquiry.owner_note}
            rows={3}
            placeholder="e.g. Visited on Sunday, wants Premium package quote"
            onBlur={(e) =>
              e.target.value !== enquiry.owner_note && onUpdate(enquiry.id, { owner_note: e.target.value })
            }
          />
        </label>
        <p className="text-[11px] text-muted">Status and note save automatically when changed.</p>
      </div>
    </div>
  );
}
