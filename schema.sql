DROP TABLE IF EXISTS addMovie;


CREATE TABLE IF NOT EXISTS addMovie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    overView TEXT,
    mins VARCHAR(255),
    releaseDate DATE,
    posterPath VARCHAR(255)
);