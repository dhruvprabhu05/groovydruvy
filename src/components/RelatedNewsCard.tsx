import type { Article } from "@/lib/db";

export default function RelatedNewsCard({ articles }: { articles: Article[] }) {
  return (
    <div className="card">
      <div className="card-title">Related News</div>
      {articles.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No recent news for this ticker.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {articles.map((article) => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", padding: "6px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.02)", display: "block" }}>
              {article.title}<span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>· {article.source}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
