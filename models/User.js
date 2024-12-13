const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// 读取用户列表文件
const getUsersList = () => {
    try {
        const usersFile = path.join(__dirname, '..', 'users.txt');
        const content = fs.readFileSync(usersFile, 'utf8');
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    } catch (error) {
        console.error('无法读取用户列表文件，使用示例文件');
        const exampleFile = path.join(__dirname, '..', 'users.example.txt');
        const content = fs.readFileSync(exampleFile, 'utf8');
        return content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
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