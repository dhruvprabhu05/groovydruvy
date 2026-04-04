import { sql } from "@vercel/postgres";

export interface Article {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  sector: string;
  type: string;
  tickers: string | null;
  published_at: string;
  fetched_at: string;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  price: number | null;
  change_pct: number | null;
  volume: number | null;
  rsi: number | null;
  sma_20: number | null;
  sma_50: number | null;
  high_52w: number | null;
  low_52w: number | null;
  signal: string | null;
  signal_reason: string | null;
  date: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  added_at: string;
}

export interface MarketSummary {
  date: string;
  sp500: number | null;
  sp500_change: number | null;
  nasdaq: number | null;
  nasdaq_change: number | null;
  dow: number | null;
  dow_change: number | null;
  vix: number | null;
  fear_greed: number | null;
  recap: string | null;
  outlook: string | null;
}

export interface EarningsEntry {
  ticker: string;
  name: string;
  earnings_date: string;
  estimate_eps: number | null;
}

export async function getLatestMarketSummary(): Promise<MarketSummary | null> {
  const { rows } = await sql`SELECT * FROM market_summary ORDER BY date DESC LIMIT 1`;
  return (rows[0] as MarketSummary) ?? null;
}

export async function getArticles(): Promise<Article[]> {
  const { rows } = await sql`SELECT DISTINCT ON (url) * FROM articles WHERE published_at >= NOW() - INTERVAL '3 weeks' ORDER BY url, published_at DESC`;
  return (rows as Article[]).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 50);
}

export async function getRecommendedStocks(): Promise<Stock[]> {
  const { rows } = await sql`SELECT * FROM stocks WHERE signal IS NOT NULL ORDER BY date DESC LIMIT 10`;
  return rows as Stock[];
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { rows } = await sql`SELECT * FROM watchlist ORDER BY added_at DESC`;
  return rows as WatchlistItem[];
}

export async function getWatchlistStocks(): Promise<Stock[]> {
  const { rows } = await sql`SELECT DISTINCT ON (s.ticker) s.* FROM stocks s INNER JOIN watchlist w ON s.ticker = w.ticker ORDER BY s.ticker, s.date DESC`;
  return rows as Stock[];
}

export async function addToWatchlist(ticker: string, name: string): Promise<void> {
  await sql`INSERT INTO watchlist (ticker, name, added_at) VALUES (${ticker}, ${name}, NOW()) ON CONFLICT (ticker) DO NOTHING`;
}

export async function removeFromWatchlist(ticker: string): Promise<void> {
  await sql`DELETE FROM watchlist WHERE ticker = ${ticker}`;
}

export async function getUpcomingEarnings(): Promise<EarningsEntry[]> {
  const { rows } = await sql`SELECT * FROM earnings_calendar WHERE earnings_date >= CURRENT_DATE ORDER BY earnings_date ASC LIMIT 10`;
  return rows as EarningsEntry[];
}

export async function getStockByTicker(ticker: string): Promise<Stock | null> {
  const t = ticker.toUpperCase();
  const { rows } = await sql`SELECT * FROM stocks WHERE ticker = ${t} ORDER BY date DESC LIMIT 1`;
  return (rows[0] as Stock) ?? null;
}

export async function getArticlesForTicker(ticker: string): Promise<Article[]> {
  const pattern = `%${ticker.toUpperCase()}%`;
  const { rows } = await sql`SELECT * FROM articles WHERE tickers LIKE ${pattern} ORDER BY published_at DESC LIMIT 20`;
  return rows as Article[];
}

export async function getEarningsForTicker(ticker: string): Promise<EarningsEntry | null> {
  const t = ticker.toUpperCase();
  const { rows } = await sql`SELECT * FROM earnings_calendar WHERE ticker = ${t} AND earnings_date >= CURRENT_DATE ORDER BY earnings_date ASC LIMIT 1`;
  return (rows[0] as EarningsEntry) ?? null;
}

export async function isInWatchlist(ticker: string): Promise<boolean> {
  const t = ticker.toUpperCase();
  const { rows } = await sql`SELECT ticker FROM watchlist WHERE ticker = ${t}`;
  return rows.length > 0;
}
