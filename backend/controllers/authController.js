const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const asyncHandler = require('../utils/asyncHandler');

// Register (student or conductor)
exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = 'student',
    registrationNumber,
    department,
    semester,
  } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  // If student, ensure registration number is unique
  if (role === 'student') {
    user = await User.findOne({ registrationNumber });
    if (user) {
      return res.status(400).json({ success: false, message: 'Registration number already exists' });
    }
  }

  // Create user
  const newUser = new User({
    name,
    email,
    password,
    role,
  });

  if (role === 'student') {
    newUser.registrationNumber = registrationNumber;
    newUser.department = department;
    newUser.semester = semester;
  }

  await newUser.save();

  const accessToken = generateAccessToken(newUser._id, newUser.role);
  const refreshToken = generateRefreshToken(newUser._id, newUser.role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        registrationNumber: newUser.registrationNumber,
      },
      accessToken,
      refreshToken,
    },
  });
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'User account is inactive' });
  }

  // Update last login
  await user.updateLastLogin();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationNumber: user.registrationNumber,
      },
      accessToken,
      refreshToken,
    },
  });
});

// Refresh Token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token', error: error.message });
  }
});

// Get Current User
exports.getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        registrationNumber: req.user.registrationNumber,
        department: req.user.department,
        semester: req.user.semester,
        isActive: req.user.isActive,
        lastLogin: req.user.lastLogin,
      },
    },
  });
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});
