// const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// exports.protect = async (req, res, next) => {
//     let token;

//     // Get token from header
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     }

//     // Get token from cookie (alternative)
//     // else if (req.cookies.token) {
//     //   token = req.cookies.token;
//     // }

//     // Make sure token exists
//     if (!token) {
//         return next(new ErrorResponse('Not authorized to access this route', 401));
//     }

//     try {
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Get user from the token
//         req.user = await User.findById(decoded.id);

//         if (!req.user) {
//             return next(new ErrorResponse('No user found with this id', 404));
//         }

//         next();
//     } catch (err) {
//         return next(new ErrorResponse('Not authorized to access this route', 401));
//     }
// };


// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Protect routes - verify token
exports.protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('No token provided');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

// Role authorization
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized`
            });
        }
        next();
    };
};