export function validateUsername(req, res, next) {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid username is required'
        });
    }
    
    req.body.username = username.trim();
    next();
}