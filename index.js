const express = require("express");
const pretty = require('express-prettify');
const cors = require('cors');
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(pretty({ query: 'pretty' }));
app.use(cors());

app.get('/', function (req, res) {
  res.send('Welcome in Movies API');
});

app.listen(4200, () => {
  console.log('API Movies listen on port 5000');
})
