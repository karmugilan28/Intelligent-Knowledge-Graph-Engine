import logger from '../utils/logger.js';
import { sendError } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log detailed error stack
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\nStack: ${err.stack}`);

  // Mongoose Bad ObjectId (Cast Error)
  if (err.name === 'CastError') {
    return sendError(res, `Resource not found with id of ${err.value}`, 404);
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    return sendError(res, `Duplicate field value entered for fields: ${fields}`, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return sendError(res, message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Not authorized, invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Not authorized, token expired', 401);
  }

  // Generic Response (checks environment to hide internal trace in production)
  const message = err.isOperational ? err.message : 'Internal Server Error';
  const errors = process.env.NODE_ENV === 'development' ? { stack: err.stack } : null;

  return sendError(res, message, err.statusCode, errors);
};

export default errorHandler;
