const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection
mongoose.connect('mongodb://localhost/oer', { useNewUrlParser: true });

const Profile = require('../models/profile');
const User = require('../models/User');
const Subject = require('../models/subject');

router.post('/', async (req, res) => {
    try{
        const { gender, cellNumber, dateOfBirth, address, subjects, id } = req.body;

        var d = new Date(parseInt(dateOfBirth));
        let profile = Profile({ gender, cellNumber, dateOfBirth: d, address });

        const user = await User.findById(id);

        const prof = await Profile.findOne({ user: user });

        let profileId = '';
        let userId = user._id.toString();

        if (prof !== null) {
            profileId = prof.user._id.toString();
        }

        if (profileId == userId) {
            let a = await Profile.deleteOne({ _id: prof._id });
            console.log(a);
            profile.user = user._id;

            if (subjects.length > 0) {
                for (let i = 0; i < subjects.length; i++){
                    const subject = await Subject.findById(subjects[i]);
                    profile.subjects.push(subject);
                    await subject.save();
                }
            }

            const savedProfile = await profile.save();
            user.profile = savedProfile;
            await user.save();
            res.status(201).json(savedProfile);
        } else {
            profile.user = user._id;

            if (subjects.length > 0) {
                for (let i = 0; i < subjects.length; i++){
                    const subject = await Subject.findById(subjects[i]);
                    profile.subjects.push(subject);
                    await subject.save();
                }
            }

            const savedProfile = await profile.save();
            user.profile = savedProfile;
            await user.save();
            res.status(201).json(savedProfile);
        }
    } catch(err) {
        console.log(err);
        res.send(err.message);
    }
});

router.get('/', (req, res) => {
    Profile.find()
    .populate({
        path: 'subjects',
        select: 'title'
    })
    .populate({
        path: 'user',
        select: 'username email displayImage emailVerified userAccessLevel'
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    Profile.findOne({ user: user })
    .populate({
        path: 'subjects',
        select: 'title'
    })
    .populate({
        path: 'user',
        select: 'username displayImage email emailVerified userAccessLevel'
    })
    .then(data => {
        if (data == null)  {
            res.status(200).json({
                error: "Profile not available. Edit profile to continue"
            });
        } else {
            res.status(200).json(data);
        }
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    Profile.findOneAndUpdate({ user: user }, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.post('/delete', async (req, res) => {
    try{
        const userId = req.body.id;
        const user = await User.findById(userId);
        console.log(user.profile);
        const profile = await Profile.deleteOne({ user: user._id });
        res.status(200).json(profile);
    } catch (e) {
        console.log(e);
        res.status(503).json(e);
    }
});

module.exports = router;