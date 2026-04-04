import type { MarketSummary } from "@/lib/db";

function OutlookSection({ text }: { text: string }) {
  const sections = text.split("\n\n").filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {sections.map((section, i) => {
        const colonIdx = section.indexOf(":");
        if (colonIdx === -1) return <p key={i} style={{ fontSize: "14px" }}>{section}</p>;
        const label = section.slice(0, colonIdx).trim();
        const content = section.slice(colonIdx + 1).trim();

        let labelColor = "var(--text-secondary)";
        if (label.includes("ALERT")) labelColor = "var(--yellow)";
        if (label.includes("PRE-MARKET")) labelColor = "var(--accent)";
        if (label.includes("EARNINGS")) labelColor = "var(--green)";
        if (label.includes("REDDIT")) labelColor = "var(--yellow)";

        const items = content.includes("|") ? content.split("|").map((s) => s.trim()) : null;

        return (
          <div key={i}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: labelColor, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              {label}
            </div>
            {items ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {items.map((item, j) => (
                  <span key={j} style={{
                    fontSize: "13px",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: item.includes("+") ? "var(--green)" : item.includes("-") ? "var(--red)" : "var(--text-primary)",
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-primary)" }}>{content}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RecapWidget({ summary }: { summary: MarketSummary | null }) {
  return (
    <div className="card">
      <div className="card-title">Yesterday&apos;s Recap</div>
      {summary?.recap ? (
        <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-primary)" }}>{summary.recap}</p>
      ) : (
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No recap available.</p>
      )}
      {summary?.outlook && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
          <div className="card-title" style={{ marginBottom: "12px" }}>Today&apos;s Watch</div>
          <OutlookSection text={summary.outlook} />
        </div>
      )}
    </div>
  );
}
