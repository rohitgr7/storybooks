const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Load keys
const keys = require('./config/keys');

// Handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require('./helpers/hbs');

require('./models/user');
require('./models/story');

// Passport config
require('./config/passport')(passport);

// Load routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');

// Map global promises
mongoose.Promise = global.Promise;

// Mongoose connect
mongoose.connect(keys.mongodbURI, {
    useMongoClient: true
  })
  .then(() => console.log('Mongodb connected'))
  .catch(err => console.log(err));

const app = express();

// Body-parser Middleware
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Method Override Middleware
app.use(methodOverride('_method'));

// Handlebars Middleware
app.engine('handlebars', exphbs({
  helpers: {
    truncate,
    stripTags,
    formatDate,
    select,
    editIcon
  },
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
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
