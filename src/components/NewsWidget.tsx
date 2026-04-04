"use client";

import { useState } from "react";
import type { Article } from "@/lib/db";

const SECTORS = ["all", "tech", "finance", "crypto", "general"];
const TYPES = ["all", "breaking", "earnings", "analyst", "trending", "movers"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NewsWidget({ articles }: { articles: Article[] }) {
  const [sector, setSector] = useState("all");
  const [type, setType] = useState("all");

  const filtered = articles.filter((a) => {
    if (sector !== "all" && a.sector !== sector) return false;
    if (type !== "all" && a.type !== type) return false;
    return true;
  });

  return (
    <div className="card full-width">
      <div className="card-title">Top News</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", width: "55px" }}>Sector</span>
          {SECTORS.map((s) => (
            <button key={s} className={`filter-btn ${sector === s ? "active" : ""}`} onClick={() => setSector(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", width: "55px" }}>Type</span>
          {TYPES.map((t) => (
            <button key={t} className={`filter-btn ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>No articles match your filters.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {filtered.map((article) => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "15px", lineHeight: 1.4 }}>{article.title}</span>
                {article.tickers && <span style={{ fontSize: "12px", color: "var(--accent)", marginLeft: "8px" }}>{article.tickers}</span>}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {article.source} · {timeAgo(article.published_at)}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
