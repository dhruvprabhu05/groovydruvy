import type { Article } from "@/lib/db";
import NewsFilters from "./NewsFilters";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NewsWidget({ articles }: { articles: Article[] }) {
  return (
    <div className="card full-width">
      <div className="card-title">Top News</div>
      <NewsFilters />
      {articles.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No articles match your filters.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {articles.map((article) => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.02)", gap: "12px" }}>
              <div style={{ flex: 1 }}><span style={{ fontSize: "13px" }}>{article.title}</span>{article.tickers && <span style={{ fontSize: "11px", color: "var(--accent)", marginLeft: "8px" }}>{article.tickers}</span>}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{article.source} · {timeAgo(article.published_at)}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
