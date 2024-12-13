const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册路由
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, realName } = req.body;
        
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        const user = new User({ username, password, realName });
        await user.save();

        // 创建 JWT token
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24小时
        });

        res.redirect('/');
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).render('register', {
                error: '只有特定人员可以注册'
            });
        }
        next(error);
    }
});

// 登录页面路由
router.get('/login', (req, res) => {
    res.render('login');
});

// 注册页面路由
router.get('/register', (req, res) => {
    res.render('register');
});

// 登录路由
router.post('/login', async (req, res, next) => {
    try {
        const { username, password, remember } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).render('login', {
                error: '用户名或密码错误'
            });
        }

        // 设置 token 过期时间
        const expiresIn = remember ? '7d' : '24h';

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

// 登出路由
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router; 