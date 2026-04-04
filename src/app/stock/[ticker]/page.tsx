import { notFound } from "next/navigation";
import { getStockByTicker, getArticlesForTicker, getEarningsForTicker, isInWatchlist } from "@/lib/db";
import TickerHeader from "@/components/TickerHeader";
import IndicatorsCard from "@/components/IndicatorsCard";
import RangeCard from "@/components/RangeCard";
import SignalsCard from "@/components/SignalsCard";
import RelatedNewsCard from "@/components/RelatedNewsCard";

export default async function TickerPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();
  const [stock, articles, earnings, watchlisted] = await Promise.all([
    getStockByTicker(ticker), getArticlesForTicker(ticker), getEarningsForTicker(ticker), isInWatchlist(ticker),
  ]);
  if (!stock) notFound();
  return (
    <main>
      <TickerHeader stock={stock} inWatchlist={watchlisted} />
      <div className="widget-grid">
        <IndicatorsCard stock={stock} />
        <RangeCard stock={stock} />
        <SignalsCard stock={stock} earnings={earnings} />
        <RelatedNewsCard articles={articles} />
      </div>
    </main>
  );
}
