const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

// 管理员中间件
const isAdmin = async (req, res, next) => {
    if (!req.user || req.user.realName !== '吕浩博') {
        return res.status(403).render('error', {
            message: '权限不足',
            error: '只有管理员可以访问此页面'
        });
    }
    next();
};

// 管理员页面
router.get('/admin', requireAuth, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.render('admin', { users });
    } catch (error) {
        res.status(500).render('error', {
            message: '服务器错误',
            error: error.message
        });
    }
});

// 删除用户
router.delete('/admin/users/:id', requireAuth, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: '用户删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败', error: error.message });
    }
});

// 重置用户密码
router.post('/admin/users/:id/reset-password', requireAuth, isAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: '新密码至少需要6个字符' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
        
        res.json({ message: '密码重置成功' });
    } catch (error) {
        res.status(500).json({ message: '密码重置失败', error: error.message });
    }
});

module.exports = router; 