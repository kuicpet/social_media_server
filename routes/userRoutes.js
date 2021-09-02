import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
//import User from '../models/userModel';
const router = express.Router();

// update a user
router.put('/:id', async (req, res) => {
  const { userId } = req.body;
  if (userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).send(error);
      }
    }
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).send('Account has been updated successfully');
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    res.status(403).send('You can updated only your account');
  }
});
// delete a user
router.delete('/:id', async (req, res) => {
  const { userId } = req.body;
  if (userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).send('Account has been deleted successfully');
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(403).send('You can delete only your account');
  }
});
// get a user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, isAdmin, ...other } = user._doc;
    res.status(200).send(other);
  } catch (error) {
    return res.status(500).send(error);
  }
});
// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).send('User has been followed');
      } else {
        res.status(403).send('You already followed this user');
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    res.status(403).send('You can"t follow yourself');
  }
});
// unfollow a user
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).send('User has been unfollowed');
        } else {
          res.status(403).send('You already unfollowed this user');
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    } else {
      res.status(403).send('You can"t unfollow yourself');
    }
  });
  
export default router;
