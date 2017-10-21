const express = require('express');
const router = express.Router();
const {
  ensureAuthentication,
  ensureGuest
} = require('./../helpers/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');

router.get('/', ensureGuest, (req, res) => {
  res.render('index/welcome');
});

router.get('/about', (req, res) => {
  res.render('index/about');
});

router.get('/dashboard', ensureAuthentication, (req, res) => {
  Story.find({
      user: req.user.id
    })
    .then(stories => {
      res.render('index/dashboard', {
        stories
      });
    });
});

module.exports = router;
