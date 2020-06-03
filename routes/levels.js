const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection
mongoose.connect('mongodb://localhost/oer', { useNewUrlParser: true });

const Level = require('../models/level');
const Subject = require('../models/subject');
const User = require('../models/User');
const LearningGroup = require('../models/LearningGroup');

router.post('/', authorized, async (req, res) => {
    try{
        const { title, groupId, id } = req.body;
        let level = Level({ title });
        console.log(level, groupId);
        const user = await User.findById(id);
        const group = await LearningGroup.findById(groupId);
        console.log(group)
        level.creator = user._id;
        level.group = group._id;
        const savedLevel = await level.save();
        await group.levels.push(savedLevel);
        await group.save();
        console.log(level)
        res.status(201).json(savedLevel);
    } catch(e) {
        res.status(203).json(e);
    }
});

router.post('/add-subject', authorized, async (req, res) => {
    try{
        const { subjects, level, id } = req.body;

        const levelDoc = await Level.findById(level);
        
        for (let i = 0; i < subjects.length; i++) {
            const sub = subjects[i];
            const subject = await Subject.findById(sub);
            if (levelDoc.subjects.indexOf(subject._id) == -1) {
                await subject.levels.push(levelDoc._id);
                await subject.save();
                levelDoc.subjects.push(subject._id);
            }
            
        }
        await levelDoc.save();
        res.status(201).json(req.body);
    } catch(e) {
        res.status(203).json(e);
    }
});

router.get('/detailed', (req, res) => {
    Level.find()
    .populate({
        path: 'subjects',
        select: "title"
    })
    .populate({
        path: 'group',
        select: 'title',
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/', (req, res) => {
    Level.find()
    .populate("subjects")
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/simple', (req, res) => {
    Level.find()
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    Level.findById(req.params.id)
    .populate("subjects")
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    Level.findByIdAndDelete(req.params.id)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Level.findByIdAndUpdate(req.params.id)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;