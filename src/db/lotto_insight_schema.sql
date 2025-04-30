-- Table: results
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  draw_date DATE NOT NULL,
  company TEXT NOT NULL,
  result_no TEXT,
  CONSTRAINT unique_draw_company UNIQUE (draw_date, company)
);