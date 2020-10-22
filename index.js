const express = require("express");
const pretty = require('express-prettify');
const cors = require('cors');
const helmet = require("helmet");
const { execQuery, execQueryWithParams } = require('./db');
const bodyParser = require('body-parser');
const app = express();

app.use(helmet());
app.use(pretty({ query: 'pretty' }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.post('/search', async function (req, res) {
  const searchText = req.body.search || null;
  // let query = `SELECT title, image, id from movies WHERE to_tsvector(title) @@ to_tsquery('${searchText}') LIMIT 15`;
  let query = `SELECT * from movies where title ILIKE '%${searchText}%' LIMIT 20`;
  const response = await execQuery(query);
  res.send(response.rows);
});

app.get('/movies', async function (req, res) {
  const limit = req.query.limit || null;
  const year = req.query.year || null;
  const page = req.query.page || null;
  let query = `SELECT * from movies`;
  if(year) {
    query = `${query} WHERE`;
    if(year) {
      query = `${query} creation_date LIKE '%${year}%'`;
    }
  }

  if(limit) {
    query = `${query} LIMIT ${limit} OFFSET ${page === 1 ? 0 : page * limit}`;
  }

  const response = await execQuery(query);
  res.send(response.rows);
});

app.get('/movies/count', async function (req, res) {
  const year = req.query.year || null;
  let query = `SELECT count(*) from movies WHERE creation_date LIKE '%${year}%'`;
  const response = await execQuery(query);
  res.send(response.rows[0]);
});

app.post('/movies', async function (req, res) {
  const title = req.body.title;
  const synopsis = req.body.synopsis;
  const image = req.body.image;
  const duration = req.body.duration;
  const director = req.body.director;
  const creation_date = req.body.creation_date;
  let query = `INSERT INTO movies (title, synopsis, image ,duration, director, creation_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const response = await execQueryWithParams(query, [title, synopsis, image, duration, director, creation_date]);
  res.send(response.rows);
});

app.get('/movies/monthly', async function (req, res) {
  const currentYear = new Date().getFullYear();
  let query = `SELECT * from movies where creation_date LIKE '%octobre ${currentYear}%';`;
  const response = await execQuery(query);
  if(response.rowCount === 0){
    res.status(404).send({ error: 'Not found!' });
  }else {
    res.send(response.rows);
  }
});

app.get('/movies/:id', async function (req, res) {
  const movieId = req.params.id || null;
  let query = `SELECT * from movies WHERE id='${movieId}'`;
  const response = await execQuery(query);
  if(response.rowCount === 0){
    res.status(404).send({ error: 'Not found!' });
  }else {
    res.send(response.rows[0]);
  }
});

app.put('/movies/:id', async function (req, res) {
  const movieId = req.params.id || null;
  const image = req.body.image;
  const synopsis = req.body.synopsis;
  const title = req.body.title;
  const allocineId = req.body.allocineId;
  console.log(image)
  let query = `UPDATE movies SET allocine_id=$1, title=$2, image=$3, synopsis=$4 WHERE id=$5`;
  const response = await execQueryWithParams(query, [allocineId, title, image, synopsis, movieId]);
  res.send(response.rows);
});

app.delete('/movies/:id', async function (req, res) {
  const movieId = req.params.id || null;
  let query = `DELETE FROM movies WHERE id = $1 RETURNING *`;
  const response = await execQueryWithParams(query, [movieId]);
  if(response.name === 'error'){
    res.status(500).send({ error: 'Something failed!' });
  }else{
    res.send(response.rows);
  }
});


app.get('/historical', async function (req, res) {
  const userId = req.query.uid || null;
  let query = `SELECT * from historical WHERE user_uid='${userId}'`;
  const response = await execQuery(query);
  res.send(response.rows);
});

app.get('/historical/movie/:id', async function (req, res) {
  const userId = req.query.uid || null;
  const movieId = req.params.id || null;
  let query = `SELECT * from historical WHERE user_uid=$1 AND movie_id=$2`;
  const response = await execQueryWithParams(query, [userId, movieId]);
  res.send(response.rows);
})

app.get('/historical/seen', async function (req, res) {
  const userId = req.query.uid || null;
  let query = `SELECT movies.title, movies.image, movies.id, historical.rating from movies join historical on movies.id = historical.movie_id WHERE historical.user_uid='${userId}' AND historical.was_seen=TRUE ORDER BY title`;
  const response = await execQuery(query);
  res.send(response.rows);
});

app.get('/historical/towatch', async function (req, res) {
  const userId = req.query.uid || null;
  let query = `SELECT movies.title, movies.image, movies.id from movies join historical on movies.id = historical.movie_id WHERE historical.user_uid='${userId}' AND historical.to_watch=TRUE ORDER BY title`;
  const response = await execQuery(query);
  res.send(response.rows);
});

app.put('/historical/towatch/unsubscribe', async function (req, res) {
  const userId = req.query.uid || null;
  const movieId = req.body.movieId || null;
  let query = `UPDATE historical SET to_watch=FALSE WHERE movie_id=$1 AND user_uid=$2`;
  const response = await execQueryWithParams(query, [movieId, userId]);
  res.send(response.rows);
});

app.put('/historical/seen/unsubscribe', async function (req, res) {
  const userId = req.query.uid || null;
  const movieId = req.body.movieId || null;
  let query = `UPDATE historical SET was_seen=FALSE WHERE movie_id=$1 AND user_uid=$2`;
  const response = await execQueryWithParams(query, [movieId, userId]);
  res.send(response.rows);
});

app.get('/historical/count/towatch', async function (req, res) {
  const userId = req.query.uid || null;
  let query = `SELECT count(*) from historical WHERE user_uid='${userId}' AND to_watch=TRUE`;
  const response = await execQuery(query);
  res.send(response.rows[0].count);
});

app.get('/historical/count/seen', async function (req, res) {
  const userId = req.query.uid || null;
  let query = `SELECT count(*) from historical WHERE user_uid='${userId}' AND was_seen=TRUE`;
  const response = await execQuery(query);
  res.send(response.rows[0].count);
});

app.put('/historical/rating/:id', async function (req, res) {
  const movieId = req.params.id || null;
  const rating = req.body.rating || 0;
  let query = `UPDATE historical SET rating=$1 WHERE movie_id=$2`;
  const response = await execQueryWithParams(query, [rating, movieId]);
  res.send(response.rows);
});

app.post('/historical', async function (req, res) {
  const movieId = req.body.movieId || null;
  const userId = req.body.userId || null;
  const action = req.body.action || null;
  let query = null;

  switch(action) {
    case 'A' : 
    query = `INSERT INTO historical (movie_id, user_uid, was_seen) VALUES ($1, $2, TRUE) RETURNING *`;
    break;
    case 'B' : 
    query = `INSERT INTO historical (movie_id, user_uid, to_watch) VALUES ($1, $2, TRUE) RETURNING *`;
    default : 
      break;
  }
  const response = await execQueryWithParams(query, [movieId, userId]);
  res.send(response[0]);
});

app.put('/historical', async function (req, res) {
  const userId = req.query.uid || null;
  const movieId = req.body.movieId || null;
  const action = req.body.action || null;
  let query = null;

  switch(action) {
    case 'A' : 
    query = `UPDATE historical SET was_seen=TRUE WHERE movie_id=$1 AND user_uid=$2 RETURNING *`;
    break;
    case 'B' : 
    query = `UPDATE historical SET to_watch=TRUE WHERE movie_id=$1 AND user_uid=$2 RETURNING *`;
    default : 
      break;
  }
  const response = await execQueryWithParams(query, [movieId, userId]);
  res.send(response.rows);
});

app.get('/statistics', async function (req, res) {
  const userId = req.query.uid || null;
  let query = `select rating, array_length(array_agg(rating), 1) as count
  from historical
  WHERE was_seen=TRUE
  AND user_uid=$1
  GROUP BY rating
  ORDER BY rating;`;
  const response = await execQueryWithParams(query, [userId]);
  res.send(response);
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API Movies listen on port ${process.env.PORT ? process.env.PORT : '5000'}`);
})
