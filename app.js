const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');

// Load keys
const keys = require('./config/keys');

require('./models/user');

// Passport config
require('./config/passport')(passport);

// Load routes
const index = require('./routes/index');
const auth = require('./routes/auth');

// Map global promises
mongoose.Promise = global.Promise;

// Mongoose connect
mongoose.connect(keys.mongodbURI, {
  useMongoClient: true
})
.then(() => console.log('Mongodb connected'))
.catch(err => console.log(err));

const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global vars
app.use((req , res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', index);
app.use('/auth', auth);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
