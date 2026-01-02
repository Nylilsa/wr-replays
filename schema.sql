CREATE TABLE players (
  player_id INTEGER PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_jp TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  last_modified TEXT DEFAULT (datetime('now'))
);

CREATE TABLE player_aliases (
  id INTEGER PRIMARY KEY,
  player_id INTEGER REFERENCES players(player_id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  lang TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_modified TEXT DEFAULT (datetime('now')),
  UNIQUE(player_id, alias)
);

CREATE TABLE replays (
  id INTEGER PRIMARY KEY,
  player_id INTEGER REFERENCES players(player_id) ON DELETE SET NULL,
  game TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  shottype TEXT NOT NULL,
  replay_hash TEXT, -- full SHA-256 hex
  replay_name TEXT, -- unverified entries do not have file
  replay_score INTEGER,
  replay_date TEXT,
  replay_version TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0,1)),
  is_valid INTEGER NOT NULL DEFAULT 1 CHECK(is_valid IN (0,1)),
  created_at TEXT DEFAULT (datetime('now')),
  last_modified TEXT DEFAULT (datetime('now')),
  notes TEXT,
);

CREATE TABLE replay_sources (
  id INTEGER PRIMARY KEY,
  replay_id INTEGER NOT NULL REFERENCES replays(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT CHECK(type IN ('yt-vid', 'image', 'forum', 'misc')),
  created_at TEXT DEFAULT (datetime('now')),
  is_primary INTEGER DEFAULT 0, -- 0 means low priority, 1 means highest priority. only one can have 1
  UNIQUE(replay_id, url)
);

-- uniqueness of replay_hash
CREATE UNIQUE INDEX IF NOT EXISTS ux_replays_hash_notnull ON replays(replay_hash) WHERE replay_hash IS NOT NULL;

-- at most one primary source per replay
CREATE UNIQUE INDEX IF NOT EXISTS ux_replay_primary ON replay_sources(replay_id) WHERE is_primary = 1;
