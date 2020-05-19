require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const User = require('./models/user');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// const seedPosts = require('./seeds');
// seedPosts();

// require routes
const index = require('./routes/index');
const posts = require('./routes/posts');
const reviews = require('./routes/reviews');

const app = express();

// connect to the database
mongoose.connect('mongodb://localhost:27017/surf-shop2020', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('we\'re connected!');
});

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Setup public assets directory
app.use(express.static('public'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'Juke is the best dog',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());



// Configure Passport and Sessions
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set local variables middleware
app.use((req, res, next) => {
    req.user = {
        '_id': '5ec1004fda262b1816455847',
        // '_id': '5ec14d39d962602b22eb687a',
        'username': 'Kenji'
    };
    // For any views it gets rendered, currentUser will be available
    res.locals.currentUser = req.user;
    // set default page title
    res.locals.title = '犬どこ';
    // set success flash message
    res.locals.success = req.session.success || '';
    delete req.session.success;
    // set error flash message
    res.locals.error = req.session.error || '';
    delete req.session.error;
    // continue on to next function in middleware chain
    next();
});

// Mount routes
app.use('/', index);
app.use('/posts', posts);
app.use('/posts/:id/reviews', reviews);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};

    // // render the error page
    // res.status(err.status || 500);
    // res.render('error');
    console.log(err);
    req.session.error = err.message;
    res.redirect('back');
});

app.listen(3000, () => {
    console.log('The Surf-shop Server listening on PORT 3000');
});

module.exports = app;