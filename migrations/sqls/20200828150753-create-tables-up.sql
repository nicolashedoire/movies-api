CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocine_id TEXT,
  genders JSON,
  title TEXT,
  synopsis TEXT,
  creation_date VARCHAR(50),
  image TEXT,
  director VARCHAR(50),
  duration VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unique (title, creation_date)
);