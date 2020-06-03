const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Post = require('../models/forum/post');
const Tag = require('../models/forum/tags');
const ThumbsUp = require('../models/forum/thumbsUp');
const ThumbsDown = require('../models/forum/thumbsDown');
const Views = require('../models/forum/views');

router.post('/', async (req, res) => {
    try{
        const { title, description, id, tags } = req.body;
        const user = await User.findById(id);

        const userPost = Post({ title, description, creator: user._id });

        for (let i = 0; i < tags.length; i++) {

          let tag;
          //Check if tag exists
          tag = await Tag.findOne({ tagName: tags[i].toLowerCase() });
          if (tag == null) {
            tag = Tag({ tagName: tags[i].toLowerCase(), creator: user._id });
            await tag.save();
          }

          userPost.tags.push(tag);
        }

        await userPost.save();
        user.posts.push(userPost);
        await user.save();

        res.status(201).json(userPost);
    } catch(e) {
        res.status(201).json(e.message);
    }
});

router.post('/reply', async (req, res) => {
    try{
        const { reply, id, postId } = req.body;
        const user = await User.findById(id);
        const post = await Post.findById(postId);

        const userReply = Post({ post: reply, creator: user._id });
        userReply.parent = post._id;
        await userReply.save();
        user.posts.push(userReply);
        await user.save();
        post.thread.push(userReply);
        await post.save();

        res.status(201).json(userReply);
    } catch(e) {
        console.log(e.message);
        res.status(203).json(e.message);
    }
});

router.post("/thumbs-up", async (req, res) => {
  try {
    const { id, postId } = req.body;
    const user = await User.findById(id);
    const post = await Post.findById(postId);

    const thmb = await ThumbsUp.findOne({ creator: user._id, post: post._id });
    const thmbDown = await ThumbsDown.findOne({ creator: user._id, post: post._id });

    if (thmbDown != null) {
      let index = post.thumbsDown.indexOf(thmbDown._id);
      if (index > -1) {
        post.thumbsDown.splice(index, 1);
        await thmbDown.remove();
      }
      await post.save();
    }

    if (thmb == null) {
      const thumbsUp = ThumbsUp({ post: post._id, creator: user._id });
      await thumbsUp.save();
      post.thumbsUp.push(thumbsUp);
      await post.save();
      res.status(200).json({ likes: post.thumbsUp.length, dislikes: post.thumbsDown.length });
    } else {
      let index = post.thumbsUp.indexOf(thmb._id);
      if (index > -1) {
        post.thumbsUp.splice(index, 1);
        await thmb.remove();
      }
      await post.save();
      res.status(200).json({ likes: post.thumbsUp.length, dislikes: post.thumbsDown.length });
    }
    
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.post("/thumbs-down", async (req, res) => {
  try {
    const { id, postId } = req.body;
    const user = await User.findById(id);
    const post = await Post.findById(postId);

    const thmb = await ThumbsDown.findOne({ creator: user._id, post: post._id });

    const thmbUp = await ThumbsUp.findOne({ creator: user._id, post: post._id });

    if (thmbUp != null) {
      let index = post.thumbsUp.indexOf(thmbUp._id);
      if (index > -1) {
        post.thumbsUp.splice(index, 1);
        await thmbUp.remove();
      }
      await post.save();
    }
    if (thmb == null) {
      const thumbsDown = ThumbsDown({ post: post._id, creator: user._id });
      await thumbsDown.save();
      post.thumbsDown.push(thumbsDown);
      await post.save();
      res.status(200).json({ likes: post.thumbsUp.length, dislikes: post.thumbsDown.length });
    } else {
      let index = post.thumbsDown.indexOf(thmb._id);
      if (index > -1) {
        post.thumbsDown.splice(index, 1);
        await thmb.remove();
      }
      await post.save();
      res.status(200).json({ likes: post.thumbsUp.length, dislikes: post.thumbsDown.length });
    }
    
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.post("/add-view", async (req, res) => {
  try {
    const { id, postId } = req.body;
    const user = await User.findById(id);
    const post = await Post.findById(postId);

    const vie = await Views.findOne({ creator: user._id, post: post._id });

    if (vie == null) {
      const view = Views({ post: post._id, creator: user._id });
      await view.save();
    }

    res.status(200).json({ views: post.views.length });
    
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/:page", async (req, res) => {
  const sort = req.query.sort;
  try {
    const posts = await Post.paginate(
      { parent: undefined },
      {
        page: req.params.page,
        limit: 20,
      }
    );
    res.status(200).json(posts);
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/find/:page", async (req, res) => {
  const tagString = req.query.tag;
  try {
    const tag = await Tag.findOne({ tagName: tagString });
    if (tag != null) {
      const posts = await Post.paginate(
        { tags: { $all: tag } },
        {
          page: req.params.page,
          limit: 20,
        }
      );
      res.status(200).json(posts);
    } else {
      res.json({ error: 'Tag not available' });
    }
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/comments/:id/:page", async (req, res) => {
  try {
      const posts = await Post.paginate(
        { parent: req.params.id },
        {
          page: req.params.page,
          limit: 20,
        }
      );
      res.status(200).json(posts);
  } catch (e) {
    res.json({ error: e.message });
  }
});

module.exports = router;