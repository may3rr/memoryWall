const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const Comment = require('../models/Comment');
const { auth, isAuthenticated } = require('../middlewares/auth');

// 添加评论
router.post('/memory/:id/comment', auth, isAuthenticated, async (req, res) => {
    try {
        const memoryId = req.params.id;
        const { content } = req.body;

        // 验证内存是否存在
        const memory = await Memory.findById(memoryId);
        if (!memory) {
            return res.status(404).json({ message: '未找到该记忆' });
        }

        // 创建新评论
        const comment = new Comment({
            content,
            memory: memoryId,
            user: req.user._id
        });

        // 保存评论
        await comment.save();

        // 更新内存的评论列表
        memory.comments = memory.comments || [];
        memory.comments.push(comment._id);
        await memory.save();

        // 填充用户信息后返回
        await comment.populate('user', 'username');

        res.status(201).json({
            _id: comment._id,
            content: comment.content,
            user: {
                username: comment.user.username
            },
            createdAt: comment.createdAt
        });
    } catch (error) {
        console.error('添加评论失败:', error);
        res.status(500).json({ message: '添加评论失败' });
    }
});

// 获取记忆的评论列表
router.get('/memory/:id/comments', auth, async (req, res) => {
    try {
        const memoryId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const comments = await Comment.find({ memory: memoryId })
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Comment.countDocuments({ memory: memoryId });

        res.json({
            comments,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('获取评论列表失败:', error);
        res.status(500).json({ message: '获取评论列表失败' });
    }
});

// 删除评论（仅评论作者和管理员可删除）
router.delete('/comment/:id', auth, isAuthenticated, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ message: '评论不存在' });
        }

        // 检查是否是评论作者
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '没有权限删除此评论' });
        }

        // 从内存中移除评论引用
        await Memory.findByIdAndUpdate(
            comment.memory,
            { $pull: { comments: comment._id } }
        );

        // 删除评论
        await comment.remove();

        res.json({ message: '评论已删除' });
    } catch (error) {
        console.error('删除评论失败:', error);
        res.status(500).json({ message: '删除评论失败' });
    }
});

module.exports = router; 