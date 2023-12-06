// Middleware to check authentication

const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  let authHeader;

  try {
   authHeader = await req.get('Authorization');

  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }}
  catch(err) {if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
  }  
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'KateJenDanaHaileyJamieJennifer')
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};