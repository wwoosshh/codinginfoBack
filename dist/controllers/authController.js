"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or username already exists',
            });
        }
        const user = new User_1.default({
            username,
            email,
            password,
            role: role || 'user',
        });
        await user.save();
        const token = generateToken(user._id.toString());
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                error: error.message,
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials',
            });
        }
        const token = generateToken(user._id.toString());
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map