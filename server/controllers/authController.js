const User = require('../models/User');
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds

const createToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: maxAge
  });
};

module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const user = await User.create({ username, email, password });
    const token = createToken(user._id, user.isAdmin);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id, user.isAdmin);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};