const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Profile Works' }));

// @route   POST api/profile
// @desc    Create/Edit user's profile
// @access  Private
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        //Get fields
        const profileFields = {};
        profileFields.user = req.user.id;
        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.githubusername)
            profileFields.githubusername = req.body.githubusername;

        //Skills - Split into array
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        //Social
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.linkedin)
            profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram)
            profileFields.social.instagram = req.body.instagram;
        if (req.body.facebook)
            profileFields.social.facebook = req.body.facebook;

        // Profile.deleteOne({ handle: profileFields.handle }).then(result => {
        //     res.json('Done!');
        // });
        // return;
        Profile.findOne({ handle: profileFields.handle })
            .then(profile => {
                if (profile && profile.user != req.user.id) {
                    errors.handle = 'That handle already exists';
                    return res.status(400).json(errors);
                } else {
                    Profile.findOneAndUpdate(
                        { user: req.user.id },
                        { $set: profileFields },
                        { new: true }
                    )
                        .then(profile => {
                            if (!profile) {
                                //Create profile
                                new Profile(profileFields)
                                    .save()
                                    .then(profile => {
                                        res.json(profile);
                                    })
                                    .catch(err => {
                                        return res.status(400).json(err);
                                    });
                            } else {
                                return res.json(profile);
                            }
                        })
                        .catch(err => {
                            return res.status(404).json(err);
                        });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    }
);

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const errors = {};
        Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is no profile for this user';
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => {
                return res.status(404).json(err);
            });
    }
);

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this handle';
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => {
            return res.status(404).json(err);
        });
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => {
            errors.profile = 'There is no profile this user';
            return res.status(404).json(errors);
        });
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.profile = "There aren't any profile";
                return res.status(404).json(errors);
            }
            return res.json(profiles);
        })
        .catch(err => {
            errors.profile = "There aren't any profile";
            return res.status(404).json(errors);
        });
});

// @route   POST api/profile/experience
// @desc    Add experience to current profile
// @access  Private
router.post(
    '/experience',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateExperienceInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        Profile.findOne({ user: req.user.id }).then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description,
            };
            //Add it to the exp array in profile
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
        });
    }
);

// @route   POST api/profile/education
// @desc    Add education to current profile
// @access  Private
router.post(
    '/education',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateEducationInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        Profile.findOne({ user: req.user.id }).then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description,
            };
            //Add it to the exp array in profile
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile));
        });
    }
);

// @route   DELETE api/profile/experience/:experience_id
// @desc    Delete experience in Profile
// @access  Private
router.delete(
    '/experience/:experience_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            profile.experience = profile.experience.filter(exp => {
                return exp.id !== req.params.experience_id;
            });

            profile.save().then(profile => res.json(profile));
        });
    }
);

// @route   DELETE api/profile/education/:education_id
// @desc    Delete experience in Profile
// @access  Private
router.delete(
    '/education/:education_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            profile.education = profile.education.filter(exp => {
                return exp.id !== req.params.education_id;
            });

            profile.save().then(profile => res.json(profile));
        });
    }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOneAndDelete({ user: req.user.id }).then(() => {
            return res.status(204);
        });
    }
);

module.exports = router;
