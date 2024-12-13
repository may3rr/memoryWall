const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).render('error', {
      message: '输入数据无效',
      error: err.message
    });
  }
  
  res.status(500).render('error', {
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
};

module.exports = errorHandler; 