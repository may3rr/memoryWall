const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const allowedNames = [
    '吕浩博', '王天祥', '谢浩然', '张晨峰', 
    '郭炜坤', '杜浩楠', '郑天豪', '韦一博','王依','刘洋'
];

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    realName: {
        type: String,
        required: true,
        enum: allowedNames,
        message: '只有特定人员可以注册'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 