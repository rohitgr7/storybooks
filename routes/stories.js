const express = require('express');
const router = express.Router();
const {
  ensureAuthentication,
  ensureGuest
} = require('./../helpers/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');

// Stories index
router.get('/', (req, res) => {
  Story.find({
      status: 'public'
    })
    .populate('user')
    .sort({
      date: 'desc'
    })
    .then(stories => {
      res.render('stories/index', {
        stories
      });
    });
});

// Add story form
router.get('/add', ensureAuthentication, (req, res) => {
  res.render('stories/add');
});

// list stories from a user
router.get('/user/:userId', (req, res) => {
  Story.find({
      user: req.params.userId,
      status: 'public'
    })
    .populate('user')
    .then(stories => {
      res.render('stories/index', {
        stories
      });
    });
});

// Logged in users stories
router.get('/my', (req, res) => {
  Story.find({
      user: req.user.id
    })
    .populate('user')
    .then(stories => {
      res.render('stories/index', {
        stories
      });
    });
});

// Edit story form
router.get('/edit/:id', ensureAuthentication, (req, res) => {
  Story.findOne({
      _id: req.params.id
    })
    .then(story => {
      if (story.user != req.user.id) {
        res.redirect('/stories');
      } else {
        res.render('stories/edit', {
          story
        });
      }
    });
});

// Process add stories
router.post('/', (req, res) => {
  let allowComments;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newStory = new Story({
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments,
    user: req.user.id
  });
  newStory.save()
    .then(story => {
      res.redirect(`/stories/show/${story._id}`);
    });
});

// Show single story
router.get('/show/:id', (req, res) => {
  Story.findOne({
      _id: req.params.id
    })
    .populate('user')
    .populate('comments.commentUser')
    .then(story => {
      if (story.status === 'public') {
        res.render('stories/show', {
          story
        });
      } else {
        if (req.user) {
          if (req.user.id === story.user._id) {
            res.redirect('/stories/show', {
              story
            });
          } else {
            res.redirect('/stories');
          }
        } else {
          res.redirect('/stories');
        }
      }
    });
});

// Edit form process
router.put('/:id', (req, res) => {
  Story.findOne({
      _id: req.params.id
    })
    .then(story => {
      let allowComments;
      if (req.body.allowComments) {
        allowComments = true;
      } else {
        allowComments = false;
      }

      story.title = req.body.title;
      story.body = req.body.body;
      story.status = req.body.status;
      story.allowComments = allowComments;

      story.save()
        .then(story => {
          res.redirect('/dashboard');
        });
    });
});

// DeLete Story
router.delete('/:id', (req, res) => {
  Story.remove({
      _id: req.params.id
    })
    .then(() => {
      res.redirect('/dashboard');
    });
});

// Add Comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({
      _id: req.params.id
    })
    .then(story => {
      const newComment = {
        commentBody: req.body.commentBody,
        commentUser: req.user.id
      };

      // Push to comments array
      story.comments.unshift(newComment);

      story.save()
        .then(story => {
          res.redirect(`/stories/show/${story.id}`);
        });
    });
});

module.exports = router;
