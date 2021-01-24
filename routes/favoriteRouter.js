const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

//GENERAL
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('favorite.user')
    .populate('favorite.campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //Check if a favorite document already exists.
    
    if(Favorite.findOne({user: req.user.id}))
    {
        //check which campsites in the req.body already exist in the data
        //store. Add the ones that don't. 
        req.body.campsites.foreach((campsite) =>{
            if(!favorite.campsites.includes(campsite))
            {
                favorite.campsites.push(campsite);
            }
        })
        .then(favorite => {
            console.log('Campsites added to your favorites ', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
            })
        .catch(err => next(err));

    }

    Favorite.create(req.body)
    .then(favorite => {
        console.log('Favorite Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
        })
    .catch(err => next(err));
    
    //else, create a new instance of a Favorite document and add the 
    //campsites from the req.body array. 
    // Favorite.create(req.body)
    // .then(favorite => {
    //     console.log('Favorite Created ', favorite);
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     //res.json will automatically close the response stream after executing.
    //     //Therefore, res.end() is not needed here.
    //     res.json(favorite);
    //     })
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if(Favorite.find({user: req.user.id}))
    {
        Favorite.findOneAndDelete({user: req.user.id})
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err));
    }
    else{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete');
    }
});

//BY CAMPSITE ID
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('This operation is not supported.');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body
    }, { new: true })
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;