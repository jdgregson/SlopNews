CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    days_ago INTEGER NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    image_thumb TEXT
);

CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);