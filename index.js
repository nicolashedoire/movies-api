const express = require("express");
const pretty = require('express-prettify');
const cors = require('cors');
const helmet = require("helmet");
require('./db');

const app = express();

app.use(helmet());
app.use(pretty({ query: 'pretty' }));
app.use(cors());

app.get('/', function (req, res) {
  res.send('Welcome in Movies API');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`API Movies listen on port ${process.env.PORT} || 5000`);
})
