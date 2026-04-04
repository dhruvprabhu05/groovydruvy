export const dynamic = "force-dynamic";

import { getLatestMarketSummary, getArticles, getRecommendedStocks, getWatchlistStocks, getUpcomingEarnings } from "@/lib/db";
import MarketSummaryBar from "@/components/MarketSummaryBar";
import RecapWidget from "@/components/RecapWidget";
import RecommendedWidget from "@/components/RecommendedWidget";
import WatchlistWidget from "@/components/WatchlistWidget";
import EarningsWidget from "@/components/EarningsWidget";
import NewsWidget from "@/components/NewsWidget";

export default async function DashboardPage() {
  const [summary, articles, recommended, watchlistStocks, earnings] = await Promise.all([
    getLatestMarketSummary(), getArticles(), getRecommendedStocks(), getWatchlistStocks(), getUpcomingEarnings(),
  ]);
  const lastUpdated = summary?.date ? new Date(summary.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : null;
  return (
    <main>
      <MarketSummaryBar summary={summary} />
      {lastUpdated && <div style={{ padding: "0 24px", fontSize: "12px", color: "var(--text-muted)" }}>Last updated: {lastUpdated}</div>}
      <div className="widget-grid">
        <RecapWidget summary={summary} />
        <RecommendedWidget stocks={recommended} />
        <WatchlistWidget stocks={watchlistStocks} />
        <EarningsWidget earnings={earnings} />
        <NewsWidget articles={articles} />
      </div>
    </main>
  );
}
