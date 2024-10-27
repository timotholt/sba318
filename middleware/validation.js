import { validation } from '../utils/validation.js';

// Username validation middleware
export function validateUsername(req, res, next) {
    // Check all possible locations for username
    const username = req.params.username || req.body.username || req.query.username;
    
    if (!username || !validation.username.pattern.test(username)) {
        return res.status(400).json({
            success: false,
            message: validation.username.message
        });
    }

    // Store validated username in all possible locations
    if (req.params.username) {
        req.params.username = username.toLowerCase();
    }
    if (req.body.username) {
        req.body.username = username.toLowerCase();
    }
    if (req.query.username) {
        req.query.username = username.toLowerCase();
    }

    next();
}

// Password validation middleware
export function validatePassword(req, res, next) {
    const password = req.body.password;
    
    if (!password || !validation.password.pattern.test(password)) {
        return res.status(400).json({
            success: false,
            message: validation.password.message
        });
    }
    next();
}

// UUID validation middleware
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

// Nickname validation middleware
export function validateNickname(req, res, next) {
    const nickname = req.body.nickname;

    if (!nickname || !validation.nickname.pattern.test(nickname)) {
        return res.status(400).json({
            success: false,
            message: validation.nickname.message
        });
    }

    // Store trimmed nickname
    req.body.nickname = nickname.trim();
    next();
}

// Game name validation middleware
export function validateGameName(req, res, next) {
    const gameName = req.body.name;

    if (!gameName || typeof gameName !== 'string' || gameName.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid game name is required'
        });
    }

    if (gameName.length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Game name must be 50 characters or less'
        });
    }

    // Store trimmed game name
    req.body.name = gameName.trim();
    next();
}

// Chat message validation middleware
export function validateChatMessage(req, res, next) {
    const message = req.body.message;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Message cannot be empty'
        });
    }

    if (message.length > 500) {
        return res.status(400).json({
            success: false,
            message: 'Message must be 500 characters or less'
        });
    }

    // Store trimmed message
    req.body.message = message.trim();
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

    if (username && !validation.username.pattern.test(username)) {
        return res.status(400).json({
            success: false,
            message: validation.username.message
        });
    }

    // Store validated values
    if (userId) {
        req.params.userId = req.body.userId = req.query.userId = userId;
    }
    if (username) {
        req.params.username = req.body.username = req.query.username = username.toLowerCase();
    }

    next();
}


// import { validation } from '../utils/validation.js';

// export function validateUsername(req, res, next) {
//     const username = req.params.username || req.body.username;
    
//     if (!username || !validation.username.pattern.test(username)) {
//         return res.status(400).json({
//             success: false,
//             message: validation.username.message
//         });
//     }
//     next();
// }

// export function validatePassword(req, res, next) {
//     const password = req.body.password;
    
//     if (!password || !validation.password.pattern.test(password)) {
//         return res.status(400).json({
//             success: false,
//             message: validation.password.message
//         });
//     }
//     next();
// }

// // Add new userId validation middleware
// export function validateUserId(req, res, next) {
//     // Check all possible locations for userId
//     const userId = req.params.userId || req.body.userId || req.query.userId;

//     if (!userId) {
//         return res.status(400).json({
//             success: false,
//             message: 'User ID is required'
//         });
//     }

//     // Validate UUID format
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//     if (!uuidRegex.test(userId)) {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid User ID format'
//         });
//     }

//     // Store validated userId in all possible locations
//     if (req.params.userId) {
//         req.params.userId = userId;
//     }
//     if (req.body.userId) {
//         req.body.userId = userId;
//     }
//     if (req.query.userId) {
//         req.query.userId = userId;
//     }

//     next();
// }

// // Combined validation for transition period
// export function validateUserIdentity(req, res, next) {
//     const userId = req.params.userId || req.body.userId || req.query.userId;
//     const username = req.params.username || req.body.username || req.query.username;

//     if (!userId && !username) {
//         return res.status(400).json({
//             success: false,
//             message: 'Either User ID or username is required'
//         });
//     }

//     if (userId) {
//         const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//         if (!uuidRegex.test(userId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid User ID format'
//             });
//         }
//     }

//     if (username) {
//         if (typeof username !== 'string' || username.trim().length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid username format'
//             });
//         }
//     }

//     // Store validated values
//     if (userId) {
//         req.params.userId = req.body.userId = req.query.userId = userId;
//     }
//     if (username) {
//         req.params.username = req.body.username = req.query.username = username.trim();
//     }

//     next();
// }


// // export function validateUsername(req, res, next) {
// //     // Skip validation if no username is expected
// //     if (!req.params.username && !req.body.username) {
// //         return next();
// //     }

// //     // Check URL parameters first, then body
// //     const username = req.params.username || req.body.username;
    
// //     if (!username || typeof username !== 'string' || username.trim().length === 0) {
// //         return res.status(400).json({
// //             success: false,
// //             message: 'Valid username is required'
// //         });
// //     }
    
// //     // Store the validated username in both places to maintain compatibility
// //     if (req.params.username) {
// //         req.params.username = username.trim();
// //     }
// //     if (req.body.username) {
// //         req.body.username = username.trim();
// //     }
// //     next();
// // }