import express from 'express';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// create a post
router.post('/', async (req, res) => {
  const newPost = await Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(201).send(savedPost);
  } catch (error) {
    return res.status(500).send(error);
  }
});
// update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).send('The post has been updated');
    } else {
      res.status(403).send('You can only update your post');
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});
// delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).send('The post has been deleted');
    } else {
      res.status(403).send('You can only delete your post');
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});
// like or dislike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).send('Post has been liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).send('Post has been disliked');
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});
// get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).send(post);
  } catch (error) {
    return res.status(500).send(error);
  }
});
// get timeline posts
router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.findById({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.send(userPosts.concat(...friendPosts));
  } catch (error) {
    return res.status(500).send(error);
  }
});
export default router;
