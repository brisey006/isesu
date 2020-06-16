const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection


const Resource = require('../models/resource');
const User = require('../models/User');
const Subject = require('../models/subject');
const Level = require('../models/level');

router.post('/', authorized, async (req, res) => {
    try{
        const { title, description, fileUrl, fileType, hyperLink, level, subjects, id, author, publisher, licence, topic, resourceUse } = req.body;
       
        let resource = Resource({ title, description, fileUrl, fileType, hyperLink, author, publisher, licence, topic, resourceUse });
        const user = await User.findById(id);
        console.log(id);
        console.log(user);
        const subjectLevel = await Level.findById(level);
        resource.creator = user._id;
        resource.levels = [];
        resource.levels.push(subjectLevel);

        if (subjects.length > 0) {
            for (let i = 0; i < subjects.length; i++){
                const subject = await Subject.findById(subjects[i]);
                subject.resources.push(resource._id);
                resource.subjects.push(subject);
                await subject.save();
            }
        }

        const savedResource = await resource.save();
        await user.resources.push(savedResource);
        await user.save();
        res.status(201).json(savedResource);
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});

router.get('/', (req, res) => {
    Resource.find()
    .populate("levels")
    .populate("subjects")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/simple', (req, res) => {
    Resource.find()
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json({
            length: data.length,
            data
        });
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/pages/:page', (req, res) => {
    Resource.paginate({}, { page: req.params.page, limit: 20 })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/:page', (req, res) => {
    const level = req.params.level;
    Resource.paginate({
        levels: { $all: level }
    }, { page: req.params.page, limit: 20 })
    .then(data => {
        res.status(200).json(data.docs);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/subject/:subject/:page', (req, res) => {
    const subject = req.params.subject;
    console.log(subject);
    Resource.paginate({
        subjects: { $all: subject }
    }, { page: req.params.page, limit: 20 })
    .then(data => {
        res.status(200).json(data.docs);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/subject/:subject/:page', (req, res) => {
    const subject = req.params.subject;
    const level = req.params.level;
    Resource.paginate({
        subjects: { $all: subject },
        levels: { $all: level }
    }, { page: req.params.page, limit: 20 })
    .then(data => {
        res.status(200).json(data.docs);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    Resource.findById(req.params.id)
    .populate("reviews")
    .populate("levels")
    .populate("subjects")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    Resource.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Resource.findOneAndUpdate({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});


//Reviews
router.get('/:id/reviews', (req, res) => {
    Resource.findById(req.params.id)
    .select("reviews")
    .populate("reviews")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;
