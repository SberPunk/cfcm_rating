CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tg_link TEXT NOT NULL,
  description TEXT
);
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS channel_tags (
  channel_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY(channel_id, tag_id),
  FOREIGN KEY(channel_id) REFERENCES channels(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER,
  nickname TEXT,
  text TEXT NOT NULL,
  approved INTEGER DEFAULT 0,
  FOREIGN KEY(channel_id) REFERENCES channels(id)
);
