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
  
  // Log error details
  console.error(`[${timestamp}] Error:`, {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
