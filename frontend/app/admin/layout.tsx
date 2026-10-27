"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="admin-root">{children}</div>;
  }
  return (
    <div className="admin-root">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
