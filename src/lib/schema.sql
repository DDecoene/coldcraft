CREATE TABLE IF NOT EXISTS usage (
  fingerprint_id TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fingerprint_id, usage_date)
);
