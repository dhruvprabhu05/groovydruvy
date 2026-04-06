import { addToWatchlist, removeFromWatchlist } from "@/lib/db";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

async function fetchAndStoreStock(ticker: string, name: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`);
    if (!res.ok) return;
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return;
    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const closes: number[] = quotes.close.filter((c: any) => c !== null);
    if (closes.length === 0) return;
    const current = closes[closes.length - 1];
    const previous = closes.length > 1 ? closes[closes.length - 2] : current;
    const volumes: number[] = quotes.volume.filter((v: any) => v !== null);

    // Calculate technical indicators from historical data
    const rsi = calculateRSI(closes, 14);
    const sma20 = closes.length >= 20 ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
    const sma50 = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;

    const today = new Date().toISOString().split("T")[0];
    const id = crypto.randomUUID();
    await sql`INSERT INTO stocks (id, ticker, name, price, change_pct, volume, rsi, sma_20, sma_50, high_52w, low_52w, signal, signal_reason, date)
      VALUES (${id}, ${ticker}, ${name}, ${current}, ${((current - previous) / previous) * 100}, ${volumes[volumes.length - 1] ?? 0}, ${rsi}, ${sma20}, ${sma50}, ${Math.max(...closes)}, ${Math.min(...closes)}, NULL, NULL, ${today})
      ON CONFLICT (id) DO NOTHING`;
  } catch (e) {
    console.error(`Failed to fetch stock data for ${ticker}:`, e);
  }
}

function calculateRSI(closes: number[], period: number): number | null {
  if (closes.length < period + 1) return null;
  const recent = closes.slice(-(period + 1));
  let gains = 0, losses = 0;
  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i] - recent[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export async function POST(request: NextRequest) {
  const { ticker, name } = await request.json();
  if (!ticker || !name) return NextResponse.json({ error: "ticker and name required" }, { status: 400 });
  const t = ticker.toUpperCase();
  await addToWatchlist(t, name);
  // Fetch and store stock data immediately so it shows up right away
  await fetchAndStoreStock(t, name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { ticker } = await request.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });
  await removeFromWatchlist(ticker.toUpperCase());
  return NextResponse.json({ ok: true });
}
