import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import CustomError from '../utils/customError.js';
import logger from '../utils/logger.js';

export const protect = async (req, res, next) => {
  let token;

  // Read header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new CustomError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB, omit password
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new CustomError('User not found with this token context', 401));
    }

    next();
  } catch (err) {
    logger.error(`JWT validation failure: ${err.message}`);
    return next(new CustomError('Not authorized, token verification failed', 401));
  }
};
