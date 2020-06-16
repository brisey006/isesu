const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection


const Topic = require('../models/topic');
const User = require('../models/User');
const Level = require('../models/level');
const Competence = require('../models/competence');
const Subject = require('../models/subject');

router.post('/', authorized, async (req, res) => {
    try {

        const { title, levelId, subjectId, topicId, id } = req.body;
       
        let competence = Competence({ title });
        const user = await User.findById(id);
        const topic = await Topic.findById(topicId);
        const level = await Level.findById(levelId);
        const subject = await Subject.findById(subjectId);

        competence.creator = user._id;
        competence.topic = topic._id;
        competence.level = level._id;
        competence.subject = subject._id;

        const savedCompetence = await competence.save();
        topic.competences.push(savedCompetence);
        topic.save();

        res.status(201).json(savedCompetence);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/', (req, res) => {
    Competence.find()
    .populate('level')
    .populate('topic')
    .populate('subject')
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    Competence.findById(req.params.id)
    .populate('level')
    .populate('topic')
    .populate('subject')
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    Competence.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Competence.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;