const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection


const Subject = require('../models/subject');
const Level = require('../models/level');
const User = require('../models/User');

router.post('/', authorized, async (req, res) => {
    try {
        const { title, id } = req.body;
        let subject = Subject({ title });
        const user = await User.findById(id);
        subject.creator = user._id;
        const savedSubject = await subject.save();
        res.status(201).json(savedSubject);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.level !== undefined) {
            const level = req.query.level;
            const subjects = await Subject.find();
            const aaar = subjects.filter((d) => {
                return d.levels.indexOf(level) > -1;
            });
            res.status(200).json(aaar);
        } else {
            const subjects = await Subject.find()
            res.status(200).json(subjects);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/simple', async (req, res) => {
    try {
        if (req.query.level !== undefined) {
            const lvl = req.query.level;
            const level = await Level.findById(lvl);
            const levels = level.subjects;

            const subjects = await Subject.find({ _id: {$in: levels} }).select('title levels');
            res.status(200).json(subjects);
        } else {
            const subjects = await Subject.find().select('title');
            res.status(200).json(subjects);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/:id', (req, res) => {
    Subject.findById(req.params.id)
    .populate('topics')
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    Subject.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Subject.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;