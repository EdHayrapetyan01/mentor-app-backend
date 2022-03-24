let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

// Express Route
const users = require('./routes/users');

const fs = require('fs');
const filePath = path.join(__dirname, './employees.csv');
// Read CSV
const f = fs.readFileSync(filePath, { encoding: 'utf-8' }, function (err) {
  console.log(err);
});

// Split on row
f = f.split('\n');
// Get first row for column headers
headers = f.shift().split(',');

const json = [];
f.forEach(function (d) {
  // Loop through each row
  tmp = {};
  row = d.split(',');
  for (var i = 0; i < headers.length; i++) {
    tmp[headers[i]] = row[i];
  }
  // Add object to list
  json.push(tmp);
});

var outPath = path.join(__dirname, 'PATH_TO_JSON.json');
// Convert object to string, write json to file
fs.writeFileSync(outPath, JSON.stringify(json), 'utf8', function (err) {
  console.log(err);
});

const DB = require('./config/keys').mongoURI;

//Connect to mongo (mongoose)
mongoose.set('useNewUrlParser', true);
mongoose
  .connect(DB, { useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfuly!'))
  .catch((err) => console.log(err));

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Passport middleware
app.use(passport.initialize());
// Passport config
require('./config/passport')(passport);

app.use(cors());

app.use('/api/users', users);

// send csv

const data = require('./PATH_TO_JSON.json');

app.get('/getjson', function (req, res) {
  res.json(data);
});

// PORT

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server up and running on port ${port}`));

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
