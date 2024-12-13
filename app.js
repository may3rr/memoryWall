require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const memoriesRouter = require('./routes/memories');
const commentsRouter = require('./routes/comments');
const adminRouter = require('./routes/admin');
const cookieParser = require('cookie-parser');

const app = express();

// 基础中间件设置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件配置
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

app.use(cookieParser());

// Cloudinary 配置
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
})
.then(() => console.log('MongoDB 连接成功'))
.catch(err => console.error('MongoDB 连接失败:', err));

// 路由
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', uploadRouter);
app.use('/memories', memoriesRouter);
app.use('/', commentsRouter);
app.use('/', adminRouter);

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;