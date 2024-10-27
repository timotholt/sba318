export function validateUsername(req, res, next) {
    // Skip validation if no username is expected
    if (!req.params.username && !req.body.username) {
        return next();
    }

    // Check URL parameters first, then body
    const username = req.params.username || req.body.username;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid username is required'
        });
    }
    
    // Store the validated username in both places to maintain compatibility
    if (req.params.username) {
        req.params.username = username.trim();
    }
    if (req.body.username) {
        req.body.username = username.trim();
    }
    next();
}