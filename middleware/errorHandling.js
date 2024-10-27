// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }
}

// 404 handler for undefined routes
export function notFoundHandler(req, res, next) {
  const error = new APIError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(error);
}

// Global error handler
export function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  
  // Enhance error logging with userId if available
  const userId = req.body.userId || req.query.userId || req.params.userId;
  const logData = {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    ...(userId && { userId }), // Only include userId if it exists
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  // Log error details
  console.error(`[${timestamp}] Error:`, logData);

  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Sanitize error messages for userId-related errors
  let message = err.message;
  if (message.includes('userId')) {
    message = message.replace(/[0-9a-f-]{36}/gi, '[REDACTED]');
  }

  res.status(err.statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Add specific error types
export class UserIdError extends APIError {
  constructor(message) {
    super(message || 'Invalid or missing User ID', 400);
    this.name = 'UserIdError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message) {
    super(message || 'Not authorized to perform this action', 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends APIError {
  constructor(message) {
    super(message || 'Validation failed', 400);
    this.name = 'ValidationError';
  }
}

// Helper function to check if error is UUID related
function isUuidError(error) {
  return error.message.toLowerCase().includes('uuid') ||
         error.message.toLowerCase().includes('userid');
}

// Helper function to sanitize error messages
function sanitizeErrorMessage(message) {
  // Remove any actual UUIDs from error messages
  return message.replace(/[0-9a-f-]{36}/gi, '[REDACTED]');
}


// // Custom error class for API errors
// export class APIError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
//   }
// }

// // 404 handler for undefined routes
// export function notFoundHandler(req, res, next) {
//   const error = new APIError(`Cannot ${req.method} ${req.originalUrl}`, 404);
//   next(error);
// }

// // Global error handler
// export function errorHandler(err, req, res, next) {
//   const timestamp = new Date().toISOString();
  
//   // Log error details
//   console.error(`[${timestamp}] Error:`, {
//     method: req.method,
//     url: req.originalUrl,
//     error: err.message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });

//   // Set defaults
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     success: false,
//     message: err.message,
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// }
