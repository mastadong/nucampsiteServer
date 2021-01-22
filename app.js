var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const authenticate = require('./authenticate');
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');


//Express session objects
const session = require('express-session');
const FileStore = require('session-file-store')(session);

//This block of code instantiates mongoose and connects it to the data store (MongoDB in this case)
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);


//Code for setting up Express
var app = express();

//Redirect all incoming traffic to the HTTPS server.  Only secure traffic will be allowed
//beyond this point.
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//These two lines are used because we are choosing a session-based implementation.
app.use(passport.initialize());
// app.use(passport.session());

//Direct new visits to the index or user routes
app.use('/', indexRouter);
app.use('/users', usersRouter);


// function auth(req, res, next) {
//   console.log(req.user);

//   if (!req.user) {
//       const err = new Error('You are not authenticated!');                    
//       err.status = 401;
//       return next(err);
//   } else {
//       return next();
//   }
// }

// app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

//Declare routes
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
