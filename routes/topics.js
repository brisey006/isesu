const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection
mongoose.connect('mongodb://localhost/oer', { useNewUrlParser: true });

const Topic = require('../models/topic');
const User = require('../models/User');
const Subject = require('../models/subject');
const Level = require('../models/level');

router.post('/', authorized, async (req, res) => {
    try {
        const { title, subjectId, levelId, id } = req.body;
        let topic = Topic({ title });
        const user = await User.findById(id);
        const subject = await Subject.findById(subjectId);
        const level = await Level.findById(levelId);

        topic.creator = user._id;
        topic.subject = subject._id;
        topic.level = level._id;

        const savedTopic = await topic.save();
        subject.topics.push(savedTopic);
        subject.save();

        res.status(201).json(savedTopic);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/', (req, res) => {
    Topic.find()
    .populate("level")
    .populate("subject")
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    Topic.findById(req.params.id)
    .populate("level")
    .populate("subject")
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    Topic.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Topic.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;