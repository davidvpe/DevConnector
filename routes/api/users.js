const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load User model
const User = require('../../models/User');

const gravatar = require('gravatar');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route   GET api/users/test
// @desc    Tests user route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            let avatar = gravatar.url(req.body.email, {
                s: '200', //Size
                r: 'pg', //Rating
                d: 'mm', //Default
            });

            let newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password,
            });

            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    } else {
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(userSaved => {
                                res.json(userSaved);
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }
                });
            });
        }
    });
});

// @route   GET api/users/login
// @desc    Login user / Returning JWT token
// @access  Public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const { errors, isValid } = validateLoginInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Find the user by email
    User.findOne({ email }).then(user => {
        if (!user) {
            errors.email = 'Email not found';
            return res.status(404).json(errors);
        }

        // Check password
        bcrypt.compare(password, user.password).then(success => {
            if (success) {
                //User matched

                //Sign Token

                //Create JWT payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                };

                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: `Bearer ${token}`,
                        });
                    }
                );
            } else {
                errors.password = 'Password incorrect';
                res.status(400).json(errors);
            }
        });
    });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
        });
    }
);

module.exports = router;
