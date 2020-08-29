const express = require("express");
const pretty = require('express-prettify');
const cors = require('cors');
const helmet = require("helmet");
const { execQuery } = require('./db');

const app = express();

app.use(helmet());
app.use(pretty({ query: 'pretty' }));
app.use(cors());

app.get('/', function (req, res) {
  const query = `SELECT * from movies LIMIT 100`;
  const response = await execQuery(query);
  res.send(response);
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API Movies listen on port ${process.env.PORT} || 5000`);
})
