// Request logger middleware
export function requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    
    // Extract request details
    const {
        method,
        originalUrl,
        ip,
        headers,
    } = req;

    // Format query parameters
    const queryParams = Object.keys(req.query).length 
        ? JSON.stringify(req.query) 
        : 'none';

    // Format request body (excluding sensitive data)
    const sanitizedBody = { ...req.body };
    // if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    // if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
    // if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
    
    // Log the request
    console.log(`[${timestamp}] ${method} ${originalUrl}
    IP: ${ip}
    Query params: ${queryParams}
    Body: ${JSON.stringify(sanitizedBody)}
    User-Agent: ${headers['user-agent'] || 'none'}
    `);

    // Track response time
    const startTime = process.hrtime();

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        // Calculate response time
        const diff = process.hrtime(startTime);
        const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        console.log(`[${timestamp}] Response sent: Status ${res.statusCode}, Time: ${responseTime}ms`);

      originalEnd.call(this, chunk, encoding);
    };

    next();
}
