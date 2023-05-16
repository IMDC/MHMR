const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// define a basic route
app.get('/', (req, res) => {
  res.send('Hello World!');


// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
