
CREATE TABLE t_p18423906_subbotino_service_ap.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ЖКХ',
  date TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p18423906_subbotino_service_ap.ads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Аноним',
  phone TEXT,
  photo TEXT,
  category TEXT NOT NULL DEFAULT 'Продам',
  status TEXT NOT NULL DEFAULT 'pending',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p18423906_subbotino_service_ap.messages (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  mine BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p18423906_subbotino_service_ap.news_comments (
  id SERIAL PRIMARY KEY,
  news_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p18423906_subbotino_service_ap.news_reactions (
  news_id INTEGER PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0
);
