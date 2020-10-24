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


CREATE TABLE IF NOT EXISTS historical (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  user_uid TEXT,
  seen_date DATE,
  to_watch BOOLEAN DEFAULT false,
  was_seen BOOLEAN DEFAULT false,
  rating INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unique(movie_id, user_uid)
);

CREATE TABLE IF NOT EXISTS movies_on_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  platforms JSON,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unique(movie_id);
);