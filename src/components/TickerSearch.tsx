"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TickerSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (ticker) { router.push(`/stock/${ticker}`); setQuery(""); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex" }}>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ticker..."
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 12px", color: "var(--text-primary)", fontSize: "13px", width: "180px", outline: "none" }} />
    </form>
  );
}
