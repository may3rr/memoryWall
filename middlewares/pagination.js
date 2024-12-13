const paginationMiddleware = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  
  req.pagination = {
    skip: (page - 1) * limit,
    limit: limit,
    page: page
  };
  
  next();
};

module.exports = paginationMiddleware; 