const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const router = require('./routes');
const keys = require('./config/keys');

require('./models/User');
// always require Models first then
require('./services/passport');

const app = express();
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongodbURI, { useMongoClient: true });
const db = mongoose.connection;
db.once('open', () => {
  console.log('connected to db');
});

app.use(require('body-parser').json());

app.use(cookieSession({
  maxAge: 30 * 24 * 60 * 60 * 1000,
  keys: [keys.cookieKey],
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.warn('listening on PORT ', PORT);
});
