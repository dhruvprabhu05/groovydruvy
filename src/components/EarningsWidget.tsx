import Link from "next/link";
import type { EarningsEntry } from "@/lib/db";

export default function EarningsWidget({ earnings }: { earnings: EarningsEntry[] }) {
  return (
    <div className="card">
      <div className="card-title">Upcoming Earnings</div>
      {earnings.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No upcoming earnings.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {earnings.map((entry) => (
            <Link key={`${entry.ticker}-${entry.earnings_date}`} href={`/stock/${entry.ticker}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.03)" }}>
              <div><span style={{ fontWeight: 600, fontSize: "13px" }}>{entry.ticker}</span><span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>{entry.name}</span></div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {new Date(entry.earnings_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {entry.estimate_eps !== null && <span style={{ marginLeft: "8px", color: "var(--text-muted)" }}>EPS est: ${entry.estimate_eps.toFixed(2)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
