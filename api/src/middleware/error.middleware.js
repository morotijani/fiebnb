const AppError = require('../utils/AppError');

const handlePrismaUniqueConstraintError = (err) => {
  return new AppError('Duplicate field value entered. Please use another value.', 400);
};

const handlePrismaRecordNotFoundError = (err) => {
  return new AppError('Resource not found.', 404);
};

const handlePrismaForeignKeyConstraintError = (err) => {
  return new AppError('Invalid reference. The related record does not exist.', 400);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    // Prisma Error Translations
    if (error.code === 'P2002') error = handlePrismaUniqueConstraintError(error);
    if (error.code === 'P2025') error = handlePrismaRecordNotFoundError(error);
    if (error.code === 'P2003') error = handlePrismaForeignKeyConstraintError(error);

    if (error.isOperational) {
      // Trusted, operational error: send message to client
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error('ERROR 💥', err);
      
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    // Fallback for non-specified environments (usually acts like development)
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

module.exports = errorHandler;
