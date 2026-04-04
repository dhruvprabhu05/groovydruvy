import type { MarketSummary } from "@/lib/db";

export default function RecapWidget({ summary }: { summary: MarketSummary | null }) {
  return (
    <div className="card">
      <div className="card-title">Yesterday&apos;s Recap</div>
      {summary?.recap ? <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--text-primary)" }}>{summary.recap}</p> : <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No recap available.</p>}
      {summary?.outlook && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "6px" }}>Today&apos;s Watch</div>
          <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>{summary.outlook}</p>
        </div>
      )}
    </div>
  );
}
