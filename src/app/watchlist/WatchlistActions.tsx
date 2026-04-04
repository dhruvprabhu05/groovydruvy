"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WatchlistActions({ ticker, mode }: { ticker?: string; mode?: "remove" }) {
  const router = useRouter();
  const [input, setInput] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim().toUpperCase();
    if (!t) return;
    await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker: t, name: t }) });
    setInput(""); router.refresh();
  }

  async function handleRemove() {
    if (!ticker) return;
    await fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker }) });
    router.refresh();
  }

  if (mode === "remove") return <button onClick={handleRemove} style={{ background: "transparent", border: "1px solid rgba(255,87,87,0.3)", borderRadius: "4px", color: "var(--red)", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>Remove</button>;

  return (
    <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px" }}>
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add ticker (e.g. AAPL)" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "13px", width: "200px", outline: "none" }} />
      <button type="submit" style={{ background: "var(--accent)", border: "none", borderRadius: "6px", padding: "8px 16px", color: "#0f1117", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Add</button>
    </form>
  );
}
