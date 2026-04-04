import { Pool } from "pg";
import RssParser from "rss-parser";

const rssParser = new RssParser();
const FINNHUB_KEY = process.env.FINNHUB_API_KEY ?? "";
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY ?? "";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

function uuid(): string { return crypto.randomUUID(); }
function today(): string { return new Date().toISOString().split("T")[0]; }
function now(): string { return new Date().toISOString(); }

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
  return res.json();
}

const SECTOR_KEYWORDS: Record<string, string[]> = {
  tech: ["tech", "AI", "artificial intelligence", "semiconductor", "chip", "software", "SaaS", "cloud", "NVIDIA", "AAPL", "MSFT", "GOOGL", "META", "AMZN", "TSLA", "cyber", "data center", "machine learning", "robotics", "5G", "quantum"],
  finance: ["bank", "fed", "interest rate", "inflation", "treasury", "financial", "JPM", "GS", "fintech", "lending", "mortgage", "credit", "loan", "hedge fund", "private equity", "IPO", "SEC", "Wall Street"],
  crypto: ["bitcoin", "crypto", "ethereum", "BTC", "ETH", "blockchain", "defi", "stablecoin", "altcoin", "NFT", "web3", "solana", "XRP", "dogecoin"],
  healthcare: ["health", "pharma", "biotech", "FDA", "drug", "medical", "hospital", "vaccine", "clinical trial", "therapeutics", "JNJ", "PFE", "UNH", "ABBV", "MRK", "LLY", "patient", "treatment", "disease", "cancer", "diabetes", "obesity", "weight loss", "Ozempic", "Wegovy", "insurance", "Medicare", "Medicaid"],
  energy: ["oil", "gas", "energy", "solar", "wind", "renewable", "EV", "battery", "nuclear", "OPEC", "petroleum", "XOM", "CVX", "NEE", "ENPH", "electric vehicle", "charging", "grid", "power", "utility", "fossil fuel", "carbon", "emission", "climate", "drilling", "pipeline"],
  realestate: ["real estate", "housing", "mortgage", "REIT", "property", "rent", "commercial real estate", "home sales", "construction", "home price", "interest rate", "housing market", "apartment", "office space", "vacancy", "landlord", "tenant", "foreclosure"],
  consumer: ["retail", "consumer", "e-commerce", "Amazon", "Walmart", "Target", "spending", "shopping", "WMT", "TGT", "COST", "NKE", "SBUX", "MCD", "grocery", "restaurant", "food", "apparel", "luxury", "brand", "store", "mall", "Black Friday", "holiday sales", "consumer confidence", "discretionary"],
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  earnings: ["earnings", "revenue", "profit", "EPS", "quarterly results", "beats", "misses", "guidance", "forecast", "outlook", "report card", "bottom line", "top line", "fiscal", "income"],
  analyst: ["upgrade", "downgrade", "analyst", "price target", "rating", "overweight", "underweight", "outperform", "underperform", "buy rating", "sell rating", "hold rating", "initiates coverage", "raises target", "cuts target", "bull case", "bear case"],
  movers: ["surge", "plunge", "soar", "crash", "rally", "tank", "spike", "tumble", "jump", "drop", "climb", "slide", "skyrocket", "plummet", "gain", "loss", "record high", "record low", "all-time", "selloff", "sell-off", "breakout", "melt"],
  trending: ["viral", "buzz", "hype", "frenzy", "mania", "meme stock", "short squeeze", "trending", "popular", "hot stock", "most watched", "most active"],
};

function classifySector(text: string): string {
  const lower = text.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) return sector;
  }
  return "general";
}

function classifyType(text: string): string {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) return type;
  }
  return "breaking";
}

const COMMON_TICKERS = [
  // Tech
  "AAPL","MSFT","GOOGL","GOOG","AMZN","META","TSLA","NVDA","AMD","NFLX","CRM","ORCL","INTC","AVGO","QCOM","ADBE","CSCO","IBM","NOW","SHOP","SNOW","PANW","CRWD","DDOG","NET","MDB","ZS","FTNT","MRVL","ARM","SMCI","DELL","HPE",
  // Finance
  "JPM","GS","MS","BAC","WFC","V","MA","PYPL","SQ","COIN","SOFI","C","AXP","BLK","SCHW","CME","ICE","COF","DFS",
  // Healthcare
  "JNJ","PFE","UNH","ABBV","MRK","LLY","TMO","ABT","AMGN","GILD","REGN","MRNA","ISRG","VRTX","BMY",
  // Energy
  "XOM","CVX","NEE","ENPH","FSLR","OXY","SLB","COP","EOG","PSX",
  // Consumer
  "WMT","TGT","COST","NKE","SBUX","MCD","DIS","CMCSA","HD","LOW","LULU","BKNG","ABNB","UBER",
  // Crypto-adjacent
  "PLTR","MSTR","RIOT","MARA","HOOD",
];


function extractTickers(text: string): string { return COMMON_TICKERS.filter((t) => text.includes(t)).join(","); }

async function fetchMarketData() {
  console.log("Fetching market indices...");
  const symbols = ["^GSPC","^IXIC","^DJI","^VIX"];
  const results: Record<string, { price: number; change: number }> = {};
  for (const sym of symbols) {
    try {
      const data = await fetchJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=2d&interval=1d`);
      const closes = data.chart.result[0].indicators.quote[0].close;
      const current = closes[closes.length - 1]; const previous = closes.length > 1 ? closes[closes.length - 2] : current;
      results[sym] = { price: current, change: ((current - previous) / previous) * 100 };
    } catch (e) { console.error(`Failed to fetch ${sym}:`, e); results[sym] = { price: 0, change: 0 }; }
  }
  return { sp500: results["^GSPC"].price, sp500_change: results["^GSPC"].change, nasdaq: results["^IXIC"].price, nasdaq_change: results["^IXIC"].change, dow: results["^DJI"].price, dow_change: results["^DJI"].change, vix: results["^VIX"].price };
}

async function fetchFearGreed(): Promise<number> {
  console.log("Fetching Fear & Greed index...");
  try { const data = await fetchJSON("https://production.dataviz.cnn.io/index/fearandgreed/graphdata"); return Math.round(data.fear_and_greed.score); }
  catch (e) { console.error("Failed:", e); return 50; }
}

async function fetchStockData(tickers: string[]) {
  console.log(`Fetching stock data for ${tickers.length} tickers...`);
  const results = [];
  for (const ticker of tickers) {
    try {
      const data = await fetchJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`);
      const meta = data.chart.result[0].meta; const quotes = data.chart.result[0].indicators.quote[0];
      const closes = quotes.close.filter((c: any) => c !== null); const current = closes[closes.length - 1]; const previous = closes.length > 1 ? closes[closes.length - 2] : current;
      const volumes = quotes.volume.filter((v: any) => v !== null);
      results.push({ ticker, name: meta.shortName ?? meta.symbol ?? ticker, price: current, change_pct: ((current - previous) / previous) * 100, volume: volumes[volumes.length - 1] ?? 0, high_52w: Math.max(...closes), low_52w: Math.min(...closes) });
    } catch (e) { console.error(`Failed to fetch ${ticker}:`, e); }
  }
  return results;
}

async function fetchTechnicalIndicators(ticker: string) {
  const result = { rsi: null as number | null, sma_20: null as number | null, sma_50: null as number | null };
  try { const d = await fetchJSON(`https://www.alphavantage.co/query?function=RSI&symbol=${ticker}&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`); const v = Object.values(d["Technical Analysis: RSI"] ?? {}) as any[]; if (v.length > 0) result.rsi = parseFloat(v[0].RSI); } catch (e) {}
  try { const d = await fetchJSON(`https://www.alphavantage.co/query?function=SMA&symbol=${ticker}&interval=daily&time_period=20&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`); const v = Object.values(d["Technical Analysis: SMA"] ?? {}) as any[]; if (v.length > 0) result.sma_20 = parseFloat(v[0].SMA); } catch (e) {}
  try { const d = await fetchJSON(`https://www.alphavantage.co/query?function=SMA&symbol=${ticker}&interval=daily&time_period=50&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`); const v = Object.values(d["Technical Analysis: SMA"] ?? {}) as any[]; if (v.length > 0) result.sma_50 = parseFloat(v[0].SMA); } catch (e) {}
  return result;
}

async function fetchHackerNews(): Promise<Array<{ title: string; summary: string; url: string; source: string; published_at: string }>> {
  console.log("Fetching Hacker News top stories...");
  try {
    const ids = await fetchJSON("https://hacker-news.firebaseio.com/v0/topstories.json");
    const stories = [];
    for (const id of ids.slice(0, 25)) {
      try {
        const item = await fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (item && item.title && item.url) {
          stories.push({ title: item.title, summary: "", url: item.url, source: "Hacker News", published_at: new Date(item.time * 1000).toISOString() });
        }
      } catch (e) { /* skip individual story errors */ }
    }
    return stories;
  } catch (e) { console.error("Hacker News failed:", e); return []; }
}

async function fetchFinnhubNews() {
  console.log("Fetching Finnhub news...");
  try { const data = await fetchJSON(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`); return data.slice(0, 30).map((item: any) => ({ title: item.headline, summary: item.summary?.slice(0, 300) ?? "", url: item.url, source: item.source, published_at: new Date(item.datetime * 1000).toISOString() })); }
  catch (e) { console.error("Finnhub news failed:", e); return []; }
}

async function fetchRSSNews() {
  console.log("Fetching RSS feeds...");
  const feeds = [
    // General market & finance
    { url: "https://feeds.marketwatch.com/marketwatch/topstories/", source: "MarketWatch" },
    { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC" },
    { url: "https://finance.yahoo.com/news/rssheadlines", source: "Yahoo Finance" },
    { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business" },
    // Tech
    { url: "https://feeds.feedburner.com/TechCrunch/", source: "TechCrunch" },
    { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica" },
    { url: "https://www.theverge.com/rss/index.xml", source: "The Verge" },
    // Crypto
    { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
    { url: "https://cointelegraph.com/rss", source: "CoinTelegraph" },
    // Healthcare
    { url: "https://www.fiercepharma.com/rss/xml", source: "Fierce Pharma" },
    { url: "https://www.statnews.com/feed/", source: "STAT News" },
    // Energy
    { url: "https://oilprice.com/rss/main", source: "OilPrice" },
    { url: "https://electrek.co/feed/", source: "Electrek" },
    // Consumer / retail
    { url: "https://www.retaildive.com/feeds/news/", source: "Retail Dive" },
    // Real estate
    { url: "https://www.housingwire.com/feed/", source: "HousingWire" },
  ];
  const articles = [];
  for (const feed of feeds) {
    try { const parsed = await rssParser.parseURL(feed.url); for (const item of parsed.items.slice(0, 15)) articles.push({ title: item.title ?? "Untitled", summary: (item.contentSnippet ?? item.content ?? "").slice(0, 300), url: item.link ?? "", source: feed.source, published_at: item.isoDate ?? now() }); }
    catch (e) { console.error(`RSS failed for ${feed.source}:`, e); }
  }
  return articles;
}

async function fetchRedditTrending(): Promise<string[]> {
  console.log("Fetching Reddit trending...");
  const tickerMentions: Record<string, number> = {};
  for (const sub of ["stocks", "wallstreetbets"]) {
    try { const data = await fetchJSON(`https://www.reddit.com/r/${sub}/hot.json?limit=25`); for (const post of data.data.children) { const text = (post.data.title + " " + (post.data.selftext ?? "")).toUpperCase(); for (const ticker of COMMON_TICKERS) if (text.includes(ticker)) tickerMentions[ticker] = (tickerMentions[ticker] ?? 0) + 1; } }
    catch (e) { console.error(`Reddit r/${sub} failed:`, e); }
  }
  return Object.entries(tickerMentions).filter(([_, c]) => c >= 3).sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

async function fetchAnalystPicks(): Promise<Array<{ ticker: string; reason: string }>> {
  console.log("Fetching analyst recommendations...");
  const picks: Array<{ ticker: string; reason: string }> = [];
  for (const ticker of COMMON_TICKERS.slice(0, 30)) {
    try {
      const data = await fetchJSON(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${FINNHUB_KEY}`);
      if (data.length < 2) continue;
      const latest = data[0];
      const previous = data[1];
      const buys = latest.strongBuy + latest.buy;
      const sells = latest.sell + latest.strongSell;
      const prevBuys = previous.strongBuy + previous.buy;

      // Only flag if: recent upgrade (more buys than last month) OR very strong consensus (3x+ buy vs sell)
      if (buys > prevBuys && buys > sells) {
        const newBuys = buys - prevBuys;
        picks.push({ ticker, reason: `${newBuys} new Buy rating${newBuys > 1 ? "s" : ""} (${buys} Buy / ${latest.hold} Hold / ${sells} Sell)` });
      } else if (sells > 0 && buys >= sells * 3) {
        picks.push({ ticker, reason: `Strong consensus: ${buys} Buy / ${latest.hold} Hold / ${sells} Sell` });
      }
    } catch (e) {}
  }
  return picks;
}

async function fetchEarningsCalendar(): Promise<Array<{ ticker: string; name: string; earnings_date: string; estimate_eps: number | null }>> {
  console.log("Fetching earnings calendar...");
  try { const from = today(); const to = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]; const data = await fetchJSON(`https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_KEY}`); return (data.earningsCalendar ?? []).slice(0, 20).map((item: any) => ({ ticker: item.symbol, name: item.symbol, earnings_date: item.date, estimate_eps: item.epsEstimate ?? null })); }
  catch (e) { console.error("Earnings calendar failed:", e); return []; }
}

async function main() {
  console.log(`=== GroovyDruvy Data Pipeline — ${now()} ===\n`);

  const [marketData, fearGreed, finnhubNews, rssNews, hackerNews, redditTrending, analystPicks, earningsCalendar] = await Promise.all([
    fetchMarketData(), fetchFearGreed(), fetchFinnhubNews(), fetchRSSNews(), fetchHackerNews(), fetchRedditTrending(), fetchAnalystPicks(), fetchEarningsCalendar(),
  ]);

  // Get watchlist
  let watchlistTickers: string[] = [];
  try { const res = await pool.query("SELECT ticker FROM watchlist"); watchlistTickers = res.rows.map((r: any) => r.ticker); } catch (e) { console.error("Failed to read watchlist:", e); }

  const allTickers = [...new Set([...watchlistTickers, ...redditTrending.slice(0, 20), ...analystPicks.map((p) => p.ticker)])];
  const stockData = await fetchStockData(allTickers);

  const technicals: Record<string, { rsi: number | null; sma_20: number | null; sma_50: number | null }> = {};
  for (const ticker of watchlistTickers.slice(0, 8)) { technicals[ticker] = await fetchTechnicalIndicators(ticker); await new Promise((r) => setTimeout(r, 12000)); }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clean old data
    await client.query("DELETE FROM articles WHERE fetched_at < NOW() - INTERVAL '7 days'");
    await client.query("DELETE FROM stocks WHERE date < CURRENT_DATE - INTERVAL '7 days'");
    await client.query("DELETE FROM earnings_calendar WHERE earnings_date < CURRENT_DATE");

    // Market summary
    const allNews = [...finnhubNews, ...rssNews, ...hackerNews];
    const recap = allNews.slice(0, 5).map((a) => a.title).join(". ") || "No recap available.";
    const earningsTkrs = earningsCalendar.slice(0, 3).map((entry) => entry.ticker).join(", ");
    const outlook = earningsTkrs ? `Earnings to watch: ${earningsTkrs}` : "No major earnings today.";
    await client.query(
      `INSERT INTO market_summary (date, sp500, sp500_change, nasdaq, nasdaq_change, dow, dow_change, vix, fear_greed, recap, outlook) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (date) DO UPDATE SET sp500=$2, sp500_change=$3, nasdaq=$4, nasdaq_change=$5, dow=$6, dow_change=$7, vix=$8, fear_greed=$9, recap=$10, outlook=$11`,
      [today(), marketData.sp500, marketData.sp500_change, marketData.nasdaq, marketData.nasdaq_change, marketData.dow, marketData.dow_change, marketData.vix, fearGreed, recap, outlook]
    );

    // Articles
    for (const article of allNews) {
      const fullText = article.title + " " + article.summary;
      await client.query(
        `INSERT INTO articles (id, title, summary, url, source, sector, type, tickers, published_at, fetched_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
        [uuid(), article.title, article.summary, article.url, article.source, classifySector(fullText), classifyType(fullText), extractTickers(fullText), article.published_at, now()]
      );
    }

    // Stocks
    const analystMap = new Map(analystPicks.map((p) => [p.ticker, p.reason]));
    const redditSet = new Set(redditTrending);
    for (const stock of stockData) {
      const tech = technicals[stock.ticker] ?? { rsi: null, sma_20: null, sma_50: null };
      let signal: string | null = null; let signalReason: string | null = null;
      if (analystMap.has(stock.ticker)) { signal = "analyst_pick"; signalReason = analystMap.get(stock.ticker)!; }
      else if (redditSet.has(stock.ticker)) { signal = "trending"; signalReason = "Trending on Reddit"; }
      else if (stock.change_pct > 5) { signal = "momentum"; signalReason = `Up ${stock.change_pct.toFixed(1)}% today`; }
      await client.query(
        `INSERT INTO stocks (id, ticker, name, price, change_pct, volume, rsi, sma_20, sma_50, high_52w, low_52w, signal, signal_reason, date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO UPDATE SET price=$4, change_pct=$5, volume=$6, rsi=$7, sma_20=$8, sma_50=$9, high_52w=$10, low_52w=$11, signal=$12, signal_reason=$13`,
        [uuid(), stock.ticker, stock.name, stock.price, stock.change_pct, stock.volume, tech.rsi, tech.sma_20, tech.sma_50, stock.high_52w, stock.low_52w, signal, signalReason, today()]
      );
    }

    // Earnings
    for (const entry of earningsCalendar) {
      await client.query(
        `INSERT INTO earnings_calendar (ticker, name, earnings_date, estimate_eps) VALUES ($1,$2,$3,$4) ON CONFLICT (ticker, earnings_date) DO UPDATE SET estimate_eps=$4`,
        [entry.ticker, entry.name, entry.earnings_date, entry.estimate_eps]
      );
    }

    await client.query("COMMIT");
    console.log("\n=== Pipeline complete! ===");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error("Pipeline failed:", e); process.exit(1); });
