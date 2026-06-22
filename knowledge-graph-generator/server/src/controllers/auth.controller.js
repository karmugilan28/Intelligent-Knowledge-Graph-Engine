import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import CustomError from '../utils/customError.js';
import { sendSuccess } from '../utils/response.js';

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate request body
    if (!name || !email || !password) {
      return next(new CustomError('Please provide name, email, and password', 400));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new CustomError('User already registered with this email', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    return sendSuccess(res, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request inputs
    if (!email || !password) {
      return next(new CustomError('Please provide email and password', 400));
    }

    // Get user and select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new CustomError('Invalid credentials', 401));
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new CustomError('Invalid credentials', 401));
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User profile retrieved', {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
