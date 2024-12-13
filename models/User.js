const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 从环境变量或文件获取用户列表
const getUsersList = () => {
    // 首先尝试从环境变量获取
    if (process.env.ALLOWED_USERS) {
        return process.env.ALLOWED_USERS.split(',').map(name => name.trim());
    }
    
    // 如果环境变量不存在，则从文件读取
    try {
        const fs = require('fs');
        const path = require('path');
        const usersFile = path.join(__dirname, '..', 'users.txt');
        const content = fs.readFileSync(usersFile, 'utf8');
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    } catch (error) {
        console.error('无法读取用户列表');
        return ['用户1', '用户2', '用户3']; // 默认用户列表
    }
};

const allowedNames = getUsersList();

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