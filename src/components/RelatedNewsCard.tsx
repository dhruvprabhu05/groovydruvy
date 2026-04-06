import type { Article } from "@/lib/db";

const TYPE_COLORS: Record<string, string> = {
  earnings: "#f59e0b",
  analyst: "#8b5cf6",
  movers: "#ef4444",
  trending: "#06b6d4",
  breaking: "#64748b",
};

const SECTOR_LABELS: Record<string, string> = {
  tech: "Tech",
  finance: "Finance",
  crypto: "Crypto",
  healthcare: "Healthcare",
  energy: "Energy",
  realestate: "Real Estate",
  consumer: "Consumer",
  general: "General",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default function RelatedNewsCard({ articles }: { articles: Article[] }) {
  return (
    <div className="card">
      <div className="card-title">Related News ({articles.length})</div>
      {articles.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No recent news for this ticker.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {articles.map((article) => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "13px", padding: "8px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.02)", display: "block", borderLeft: `3px solid ${TYPE_COLORS[article.type] ?? "#64748b"}` }}>
              <div style={{ fontWeight: 500, lineHeight: 1.4, marginBottom: "4px" }}>{article.title}</div>
              {article.summary && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                  {article.summary}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                <span style={{ fontWeight: 600 }}>{article.source}</span>
                <span>{timeAgo(article.published_at)}</span>
                {article.type && article.type !== "breaking" && (
                  <span style={{ padding: "1px 6px", borderRadius: "3px", background: `${TYPE_COLORS[article.type] ?? "#64748b"}22`, color: TYPE_COLORS[article.type] ?? "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {article.type}
                  </span>
                )}
                {article.sector && article.sector !== "general" && (
                  <span style={{ padding: "1px 6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", fontWeight: 500 }}>
                    {SECTOR_LABELS[article.sector] ?? article.sector}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
