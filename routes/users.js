const express = require('express');
const router = express.Router();

const User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//CREATE USER
router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then(user => {
      //does user already exist?
      if (user) {
          const err = new Error(`User ${req.body.username} already exists!`);
          err.status = 403;
          return next(err);
      } else {
          User.create({
              username: req.body.username,
              password: req.body.password})
          .then(user => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({status: 'Registration Successful!', user: user});
          })
          .catch(err => next(err));
      }
  })
  .catch(err => next(err));
});

//LOGOUT
router.post('/login', (req, res, next) => {
  //The session and authHeader must be checked before the user properties can be evaluated, even though these validation 
  //checks have already taken place in the ideal case where the user starts at the main URL.  Since it is possible for someone 
  //to bypass the index page by directly typing the URL '/users/login' (or by typing any other valid URL) the session and authHeader
  //must be checked for every route that can be accessed by an authorized user.  
  
  //Test if there is an existing session for this user (i.e. they are already logged in)
  if(!req.session.user) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
          const err = new Error('You are not authenticated!');
          res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
          return next(err);
      }
    
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];
    
      User.findOne({username: username})
      .then(user => {
          if (!user) {
              const err = new Error(`User ${username} does not exist!`);
              err.status = 401;
              return next(err);
          } else if (user.password !== password) {
              const err = new Error('Your password is incorrect!');
              err.status = 401;
              return next(err);
          } else if (user.username === username && user.password === password) {
              req.session.user = 'authenticated';
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end('You are authenticated!')
          }
      })
      .catch(err => next(err));
  } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated!');
  }
});

//LOGOUT
router.get('/logout', (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});


module.exports = router;
