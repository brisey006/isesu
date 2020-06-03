const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection
mongoose.connect('mongodb://localhost/oer', { useNewUrlParser: true });

const Post = require('../models/post');
const User = require('../models/User');
const Comment = require('../models/comment');

router.post('/', async (req, res) => {
    try{
        const { post, subject, id } = req.body;
        let postObj = Post({ post, subject });
        const user = await User.findById(id);
        postObj.creator = user._id;
        const savedPost = await postObj.save();
        await user.posts.push(savedPost);
        await user.save();
        res.status(201).json(savedPost);
    } catch(err) {
        console.log(err);
        res.send(err.message);
    }
});

router.post('/:postId/comment', async (req, res) => {
    try{
        const { comment, id } = req.body;
        let commentObj = Comment({ comment });
        const user = await User.findById(id);
        const post = await Post.findById(req.params.postId);

        commentObj.creator = user._id;
        commentObj.post = post._id;
        post.threads.push(commentObj);
        const savedComment = await commentObj.save();
        await post.save();
        res.status(201).json(savedComment);
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/', (req, res) => {
    Post.find()
    .populate({ path: "creator", select: 'username email' })
    .populate("threads")
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/simple/:page', (req, res) => {
    Post.paginate({}, { 
        page: req.params.page, 
        limit: 20,
        sort: '-created',
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
        ],
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.send(err);
    });
});

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
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
    Post.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.put('/:id', (req, res) => {
    Post.findOneAndUpdate({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.get('/comments/:post/:page', (req, res) => {
    Comment.paginate({
        post: { _id: req.params.post }
    }, {
        page: req.params.page, 
        limit: 20,
        sort: '-created',
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
        ],
    })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.get('/:id/comments', (req, res) => {
    Post.findById(req.params.id)
    .select("threads")
    .populate({
        path: "threads",
        populate: {
            path: "creator",
            select: "username email"
        }
    })
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