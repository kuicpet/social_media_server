import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
const router = express.Router();

// register
router.post('/register', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    !user && res.status(404).send('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    !validPassword && res.status(400).send('Wrong password');

    res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

export default router;
