const User = require('../models/User');
//const jwt = require('jsonwebtoken');

// Helper function to generate token
// const generateToken = (user, statusCode, res) => {
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE
//     });

//     res.status(statusCode).json({
//         success: true,
//         token,
//         user: {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone
//         }
//     });
// };

const jwt = require('jsonwebtoken');

// Modified token generation function
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '30d' // Fallback to 30 days
        }
    );
};

exports.register = async (req, res) => {
    try {
        const { accountType, name, email, phone, password, country } = req.body;

        // Input validation
        if (!accountType || !name || !email || !phone || !password || !country) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // Create user
        const user = await User.create({ accountType, name, email, phone, password, country });

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                accountType: user.accountType,
                country: user.country
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// exports.register = async (req, res, next) => {
//     try {
//         const { name, email, phone, password } = req.body;

//         // Validate required fields
//         if (!name || !email || !phone || !password) {
//             return next(new ErrorResponse('Please provide all required fields', 400));
//         }

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return next(new ErrorResponse('Email already in use', 400));
//         }

//         // Create new user
//         const user = await User.create({
//             name,
//             email,
//             phone,
//             password
//         });

//         generateToken(user, 201, res);
//     } catch (err) {
//         next(err);
//     }
// };

// exports.register = async (req, res, next) => {
//     try {
//         // Add validation
//         const { name, email, phone, password } = req.body;

//         if (!name || !email || !phone || !password) {
//             return res.status(400).json({
//                 success: false,
//                 error: "All fields are required"
//             });
//         }

//         // Rest of your registration logic...
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             error: 'Server error'
//         });
//     }
// };
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         // Validate email and password
//         if (!email || !password) {
//             return next(new ErrorResponse('Please provide email and password', 400));
//         }

//         // Check for user
//         const user = await User.findOne({ email }).select('+password');
//         if (!user) {
//             return next(new ErrorResponse('Invalid credentials', 401));
//         }

//         // Check if password matches
//         const isMatch = await user.matchPassword(password);
//         if (!isMatch) {
//             return next(new ErrorResponse('Invalid credentials', 401));
//         }

//         generateToken(user, 200, res);
//     } catch (err) {
//         next(err);
//     }
// };

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1. Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }
        // 2. Check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // 3. Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // 4. If everything ok, send token
        const token = user.getSignedJwtToken();
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id, name: user.name, email: user.email, phone: user.phone, accountType: user.accountType,
                country: user.country
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};