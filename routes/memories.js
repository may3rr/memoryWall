const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const cloudinary = require('cloudinary').v2;
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

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: '记忆不存在' });
    }

    if (memory.user && 
        memory.user.toString() !== req.user._id.toString() && 
        req.user.realName !== '吕浩博') {
      return res.status(403).json({ message: '没有权限删除此记忆' });
    }

    if (memory.imageUrl) {
      const publicId = memory.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Memory.findByIdAndDelete(req.params.id);

    res.json({ message: '记忆已成功删除' });
  } catch (error) {
    console.error('删除记忆时出错:', error);
    res.status(500).json({ message: '删除记忆时出错' });
  }
});

module.exports = router; 