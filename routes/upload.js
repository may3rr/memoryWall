const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Memory = require('../models/Memory');
const { requireAuth } = require('../middlewares/auth');

// 配置 Cloudinary 存储
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'memories',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});

// 配置 multer
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 限制
    },
    fileFilter: (req, file, cb) => {
        // 检查文件类型
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('只允许上传 JPG 和 PNG 格式的图片！'), false);
        }
        cb(null, true);
    }
});

router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('请选择要上传的图片');
        }

        const memory = new Memory({
            imageUrl: req.file.path,
            description: req.body.description,
            user: req.userId
        });

        await memory.save();
        res.redirect('/');
    } catch (error) {
        console.error('上传错误:', error);
        res.status(500).send('上传失败: ' + error.message);
    }
});

router.delete('/memory/:id', requireAuth, async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.id);
        if (!memory) {
            return res.status(404).json({ message: '未找到该记忆' });
        }

        // 检查是否是记忆的创建者
        if (memory.user.toString() !== req.userId) {
            return res.status(403).json({ message: '没有权限删除此记忆' });
        }

        // 从 Cloudinary 删除图片
        const publicId = memory.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);

        // 删除记忆
        await Memory.findByIdAndDelete(req.params.id);

        res.json({ message: '删除成功' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 