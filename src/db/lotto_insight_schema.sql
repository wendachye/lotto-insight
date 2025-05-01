-- Table: results
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  draw_date DATE NOT NULL UNIQUE,
  magnum TEXT,
  toto TEXT,
  damacai TEXT,
  sandakan TEXT,
  sabah TEXT,
  sarawak TEXT,
  singapore TEXT
);

-- Add new company to the results table
ALTER TABLE results ADD COLUMN newcompany TEXT;