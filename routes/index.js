const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const paginationMiddleware = require('../middlewares/pagination');
const { requireAuth } = require('../middlewares/auth');

router.get('/', requireAuth, paginationMiddleware, async (req, res, next) => {
  try {
    const { skip, limit, page } = req.pagination;
    
    const [memories, total] = await Promise.all([
      Memory.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username')
        .populate({
          path: 'comments',
          options: { sort: { createdAt: -1 }, limit: 5 },
          populate: {
            path: 'user',
            select: 'username'
          }
        }),
      Memory.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('index', {
      memories,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      user: req.user,
      isAuthenticated: req.isAuthenticated()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 