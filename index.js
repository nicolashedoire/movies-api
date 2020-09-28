const express = require("express");
const pretty = require('express-prettify');
const cors = require('cors');
const helmet = require("helmet");
const { execQuery, execQueryWithParams } = require('./db');

const app = express();

app.use(helmet());
app.use(pretty({ query: 'pretty' }));
app.use(cors());

app.get('/', async function (req, res) {
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`API Movies listen on port ${process.env.PORT ? process.env.PORT : '5000'}`);
})
