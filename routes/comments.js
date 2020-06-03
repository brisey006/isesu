const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection
mongoose.connect('mongodb://localhost/oer', { useNewUrlParser: true });

const Post = require('../models/post');
const User = require('../models/User');
const Comment = require('../models/comment');

router.post('/', authorized, async (req, res) => {
    try{
        const { comment, postId, id } = req.body;
        let commentObj = Comment({ comment });
        const user = await User.findById(id);
        const post = await Post.findById(postId);

        commentObj.creator = user._id;
        commentObj.post = post._id;
        post.threads.push(commentObj)
        const savedComment = await commentObj.save();
        await post.save();
        res.status(201).json(savedComment);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/', (req, res) => {
    Comment.find()
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id', (req, res) => {
    Comment.findById(req.params.id)
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

router.delete('/:id', (req, res) => {
    Comment.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Comment.findOneAndUpdate({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;