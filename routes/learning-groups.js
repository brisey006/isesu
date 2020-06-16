const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection


const LearningGroup = require('../models/LearningGroup');
const User = require('../models/User');

router.post('/', authorized, async (req, res) => {
    const { title, id } = req.body;
    let learningGroup = LearningGroup({ title });
    const user = await User.findById(id);
    learningGroup.creator = user._id;
    const savedGroup = await learningGroup.save();
    res.status(201).json(savedGroup);
});

router.get('/', (req, res) => {
    LearningGroup.find()
    .populate("levels")
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    LearningGroup.findById(req.params.id)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    LearningGroup.findByIdAndDelete(req.params.id)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    console.log(req.body);
    LearningGroup.findByIdAndUpdate(req.params.id, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;