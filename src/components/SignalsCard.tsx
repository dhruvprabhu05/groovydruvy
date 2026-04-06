import type { Stock, EarningsEntry } from "@/lib/db";

interface Signal {
  icon: string;
  label: string;
  detail: string;
  color: string;
}

function buildSignals(stock: Stock, earnings: EarningsEntry | null): Signal[] {
  const signals: Signal[] = [];

  // External signals (analyst, trending, momentum)
  if (stock.signal === "analyst_pick") {
    signals.push({ icon: "✦", label: "Analyst Pick", detail: stock.signal_reason ?? "Analyst upgrade", color: "var(--green)" });
  }
  if (stock.signal === "trending") {
    signals.push({ icon: "⚡", label: "Trending", detail: stock.signal_reason ?? "Trending on social media", color: "var(--yellow)" });
  }
  if (stock.signal === "momentum") {
    signals.push({ icon: "🔥", label: "Momentum", detail: stock.signal_reason ?? "Strong price movement", color: "var(--yellow)" });
  }

  // RSI signals
  if (stock.rsi != null) {
    if (stock.rsi >= 70) {
      signals.push({ icon: "📈", label: "Overbought", detail: `RSI at ${stock.rsi.toFixed(0)} — above 70 suggests overbought conditions`, color: "#ef4444" });
    } else if (stock.rsi <= 30) {
      signals.push({ icon: "📉", label: "Oversold", detail: `RSI at ${stock.rsi.toFixed(0)} — below 30 suggests oversold conditions`, color: "#22c55e" });
    }
  }

  // SMA crossover signals
  if (stock.price != null && stock.sma_20 != null && stock.sma_50 != null) {
    if (stock.sma_20 > stock.sma_50 && stock.price > stock.sma_20) {
      signals.push({ icon: "🟢", label: "Bullish Trend", detail: `Price above SMA20 ($${stock.sma_20.toFixed(2)}) & SMA20 above SMA50 ($${stock.sma_50.toFixed(2)})`, color: "#22c55e" });
    } else if (stock.sma_20 < stock.sma_50 && stock.price < stock.sma_20) {
      signals.push({ icon: "🔴", label: "Bearish Trend", detail: `Price below SMA20 ($${stock.sma_20.toFixed(2)}) & SMA20 below SMA50 ($${stock.sma_50.toFixed(2)})`, color: "#ef4444" });
    } else if (stock.price > stock.sma_50 && stock.price < stock.sma_20) {
      signals.push({ icon: "🟡", label: "Support Test", detail: `Price between SMA20 ($${stock.sma_20.toFixed(2)}) and SMA50 ($${stock.sma_50.toFixed(2)}) — testing support`, color: "var(--yellow)" });
    }
  }

  // 52-week range signals
  if (stock.price != null && stock.high_52w != null && stock.low_52w != null) {
    const range = stock.high_52w - stock.low_52w;
    if (range > 0) {
      const pctFromHigh = ((stock.high_52w - stock.price) / stock.high_52w) * 100;
      const pctFromLow = ((stock.price - stock.low_52w) / stock.low_52w) * 100;
      if (pctFromHigh <= 5) {
        signals.push({ icon: "🏔️", label: "Near 52W High", detail: `${pctFromHigh.toFixed(1)}% from 52-week high of $${stock.high_52w.toFixed(2)}`, color: "#22c55e" });
      } else if (pctFromLow <= 10) {
        signals.push({ icon: "🕳️", label: "Near 52W Low", detail: `${pctFromLow.toFixed(1)}% above 52-week low of $${stock.low_52w.toFixed(2)}`, color: "#ef4444" });
      }
    }
  }

  // Earnings
  if (earnings) {
    const dateStr = new Date(earnings.earnings_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const epsText = earnings.estimate_eps != null ? ` (est. EPS: $${earnings.estimate_eps.toFixed(2)})` : "";
    signals.push({ icon: "📅", label: "Upcoming Earnings", detail: `${dateStr}${epsText}`, color: "var(--text-secondary)" });
  }

  return signals;
}

export default function SignalsCard({ stock, earnings }: { stock: Stock; earnings: EarningsEntry | null }) {
  const signals = buildSignals(stock, earnings);

  return (
    <div className="card">
      <div className="card-title">Signals ({signals.length})</div>
      {signals.length === 0 ? <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No signals for this stock.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {signals.map((sig, i) => (
            <div key={i} style={{ padding: "6px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: sig.color, marginBottom: "2px" }}>{sig.icon} {sig.label}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{sig.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
