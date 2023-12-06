// AUTH ROUTES

const express = require('express');
const {
  body
} = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// ---PUT Routes---

// /auth/signup => PUT
router.put('/signup',
  [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, {
      req
    }) => {
      return User.findOne({
        email: value
      }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('E-mail address already exists!');
        }
      });
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({
      min: 5
    }),
    body('name')
    .trim()
    .not()
    .isEmpty()
  ],
  authController.signup
);


// ---POST Routes---

// /auth/login => POST
router.post('/login',
  [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
    body('password', 'Password must be valid')
    .isLength({
      min: 5
    })
    .isAlphanumeric()
    .trim()
  ],
  authController.login);

// /auth/reset => POST
router.post('/reset', authController.postReset);

// /auth/new-password => POST
router.post('/new-password', authController.postNewPassword);

module.exports = router;