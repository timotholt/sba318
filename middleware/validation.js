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

// Add new userId validation middleware
export function validateUserId(req, res, next) {
    // Check all possible locations for userId
    const userId = req.params.userId || req.body.userId || req.query.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid User ID format'
        });
    }

    // Store validated userId in all possible locations
    if (req.params.userId) {
        req.params.userId = userId;
    }
    if (req.body.userId) {
        req.body.userId = userId;
    }
    if (req.query.userId) {
        req.query.userId = userId;
    }

    next();
}

// Combined validation for transition period
export function validateUserIdentity(req, res, next) {
    const userId = req.params.userId || req.body.userId || req.query.userId;
    const username = req.params.username || req.body.username || req.query.username;

    if (!userId && !username) {
        return res.status(400).json({
            success: false,
            message: 'Either User ID or username is required'
        });
    }

    if (userId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID format'
            });
        }
    }

    if (username) {
        if (typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username format'
            });
        }
    }

    // Store validated values
    if (userId) {
        req.params.userId = req.body.userId = req.query.userId = userId;
    }
    if (username) {
        req.params.username = req.body.username = req.query.username = username.trim();
    }

    next();
}


// export function validateUsername(req, res, next) {
//     // Skip validation if no username is expected
//     if (!req.params.username && !req.body.username) {
//         return next();
//     }

//     // Check URL parameters first, then body
//     const username = req.params.username || req.body.username;
    
//     if (!username || typeof username !== 'string' || username.trim().length === 0) {
//         return res.status(400).json({
//             success: false,
//             message: 'Valid username is required'
//         });
//     }
    
//     // Store the validated username in both places to maintain compatibility
//     if (req.params.username) {
//         req.params.username = username.trim();
//     }
//     if (req.body.username) {
//         req.body.username = username.trim();
//     }
//     next();
// }