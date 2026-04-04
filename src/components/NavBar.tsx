import Link from "next/link";
import TickerSearch from "./TickerSearch";

export default function NavBar() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: "18px", color: "var(--accent)" }}>GroovyDruvy</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <TickerSearch />
        <Link href="/watchlist" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Watchlist</Link>
      </div>
    </nav>
  );
}
