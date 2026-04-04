CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'breaking',
  tickers TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS stocks (
  id TEXT PRIMARY KEY,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  price DOUBLE PRECISION,
  change_pct DOUBLE PRECISION,
  volume BIGINT,
  rsi DOUBLE PRECISION,
  sma_20 DOUBLE PRECISION,
  sma_50 DOUBLE PRECISION,
  high_52w DOUBLE PRECISION,
  low_52w DOUBLE PRECISION,
  signal TEXT,
  signal_reason TEXT,
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS watchlist (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS market_summary (
  date DATE PRIMARY KEY,
  sp500 DOUBLE PRECISION,
  sp500_change DOUBLE PRECISION,
  nasdaq DOUBLE PRECISION,
  nasdaq_change DOUBLE PRECISION,
  dow DOUBLE PRECISION,
  dow_change DOUBLE PRECISION,
  vix DOUBLE PRECISION,
  fear_greed INTEGER,
  recap TEXT,
  outlook TEXT
);

CREATE TABLE IF NOT EXISTS earnings_calendar (
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  earnings_date DATE NOT NULL,
  estimate_eps DOUBLE PRECISION,
  PRIMARY KEY (ticker, earnings_date)
);

CREATE INDEX IF NOT EXISTS idx_articles_sector ON articles(sector);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(type);
CREATE INDEX IF NOT EXISTS idx_articles_fetched ON articles(fetched_at);
CREATE INDEX IF NOT EXISTS idx_stocks_ticker ON stocks(ticker);
CREATE INDEX IF NOT EXISTS idx_stocks_date ON stocks(date);
CREATE INDEX IF NOT EXISTS idx_stocks_signal ON stocks(signal);
CREATE INDEX IF NOT EXISTS idx_earnings_date ON earnings_calendar(earnings_date);
