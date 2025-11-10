-- Blog Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  tags TEXT, -- JSON array stored as string
  image TEXT,
  author TEXT,
  publishDate TEXT,
  draft INTEGER DEFAULT 1,
  content TEXT NOT NULL, -- Lexical JSON editor state
  metadata TEXT, -- JSON object for additional metadata
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_draft ON articles(draft);
CREATE INDEX IF NOT EXISTS idx_articles_publishDate ON articles(publishDate);
