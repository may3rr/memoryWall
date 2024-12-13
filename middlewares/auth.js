const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.isAuthenticated = () => false;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            req.isAuthenticated = () => false;
            return next();
        }

        req.user = user;
        req.isAuthenticated = () => true;
        next();
    } catch (error) {
        req.isAuthenticated = () => false;
        next();
    }
};

// 检查用户是否已认证的中间件
const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: '请先登录' });
    }
    next();
};

// 检查用户是否已认证的中间件（重定向版本）
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.redirect('/login');
        }

        req.user = user;
        req.userId = user._id;
        req.isAuthenticated = () => true;
        next();
    } catch (error) {
        res.redirect('/login');
    }
};

module.exports = {
    auth,
    requireAuth,
    isAuthenticated
}; 