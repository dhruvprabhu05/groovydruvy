"use client";
import { useRouter, useSearchParams } from "next/navigation";

const SECTORS = ["all", "tech", "finance", "crypto", "general"];
const TYPES = ["all", "breaking", "earnings", "analyst", "trending", "movers"];

export default function NewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSector = searchParams.get("sector") ?? "all";
  const currentType = searchParams.get("type") ?? "all";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") { params.delete(key); } else { params.set(key, value); }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", width: "50px" }}>Sector</span>
        {SECTORS.map((s) => <button key={s} className={`filter-btn ${currentSector === s ? "active" : ""}`} onClick={() => updateFilter("sector", s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", width: "50px" }}>Type</span>
        {TYPES.map((t) => <button key={t} className={`filter-btn ${currentType === t ? "active" : ""}`} onClick={() => updateFilter("type", t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>
    </div>
  );
}
