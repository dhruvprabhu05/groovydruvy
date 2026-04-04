import type { Stock } from "@/lib/db";

export default function RangeCard({ stock }: { stock: Stock }) {
  const low = stock.low_52w; const high = stock.high_52w; const price = stock.price;
  let position = 50;
  if (low !== null && high !== null && price !== null && high > low) position = ((price - low) / (high - low)) * 100;
  const label = position > 80 ? "Near 52-week high" : position < 20 ? "Near 52-week low" : "Mid-range";
  return (
    <div className="card">
      <div className="card-title">52-Week Range</div>
      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}><span>${low?.toFixed(2) ?? "—"}</span><span>${high?.toFixed(2) ?? "—"}</span></div>
        <div style={{ background: "var(--border)", height: "6px", borderRadius: "3px", position: "relative" }}>
          <div style={{ position: "absolute", left: `${position}%`, top: "-4px", width: "14px", height: "14px", background: "var(--accent)", borderRadius: "50%", transform: "translateX(-50%)" }} />
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "center", marginTop: "10px" }}>{label}</div>
      </div>
    </div>
  );
}
