CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    start_day TEXT,
    display_preferences TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO settings (id) VALUES (1);
CREATE TABLE mission_progress (
    mission_id TEXT PRIMARY KEY,
    record_json TEXT NOT NULL
);
CREATE TABLE evidence (
    id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE INDEX evidence_mission ON evidence (mission_id);
