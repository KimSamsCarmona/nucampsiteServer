const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(favorite)
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          req.body.forEach(fav => {
            if (!favorite.campsites.includes(fav._id)) {
              favorite.campsites.push(fav._id)
            }
          })
          favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json')
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          Favorite.create({ user: req.user._id })
            .then(favorite => {
              req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                  favorite.campsites.push(fav._id)
                }
              })
              favorite.save()
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json')
                  res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err))
        }
      })
      .catch(err => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then(favorite => {
        res.statusCode = 200;
        if (favorite) {
          setHeader('Content-Type', 'application/json');
          res.json(favorite);
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.end('You do not have any favorites to delete.')
        }
      })
      .catch(err => next(err));
  })

favoriteRouter.route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.camspiteId);
            favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json')
              res.json(favorite);
            })
            .catch(err => next(err))
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is already a favorite.')
          }
        } else {
          Favorite.create({ user: req.user._id, campsite: [req.params.campsiteId] })
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(err => next(err))
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /favorites/:campsiteId');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then(favorite => {
      if(favorite) {
        const index = favorite.campsites.indexOf(req.params.campsiteid);

        if (index > 0) {
          favorite.campsites.splice(index, 1);
        }

        favorite.save()
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        })
        .catch(err => next(err));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete');
      }
    })
    .catch(err => next(err));
  })

module.exports = favoriteRouter;