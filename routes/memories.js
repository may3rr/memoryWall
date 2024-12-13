const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const memory = new Memory({
      ...req.body,
      user: req.userId
    });
    await memory.save();
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

module.exports = router; 