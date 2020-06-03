const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection
mongoose.connect('mongodb://localhost/oer', { useNewUrlParser: true });

const Review = require('../models/review');
const User = require('../models/User');
const Resource = require('../models/resource');

router.post('/', authorized, async (req, res) => {
    try {
        const { review, resourceId, rating, id } = req.body;
        let reviewObj = Review({ review, rating });

        const user = await User.findById(id);
        const resource = await Resource.findById(resourceId);

        reviewObj.creator = user._id;
        reviewObj.resource = resource._id;
        const savedReview = await reviewObj.save();

        resource.reviews.push(savedReview);
        resource.save();

        res.status(201).json(savedReview);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/', (req, res) => {
    Review.find()
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    Review.findById(req.params.id)
    .populate('topics')
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.delete('/:id', (req, res) => {
    Review.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Review.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;