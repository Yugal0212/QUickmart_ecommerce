const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_SECRET,  
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,  
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //all fildes are quired //
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed!", details: error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    user.loginHistory.push({ loginTime: Date.now() }); // Log login time
    await user.save();

    // Set cookie options - secure and sameSite handled for production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // optional: set cookie expiry to match refresh token lifespan
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      avatar: user.avatar,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed!" });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const lastLogin = user.loginHistory[user.loginHistory.length - 1];
    if (lastLogin && !lastLogin.logoutTime) {
      lastLogin.logoutTime = Date.now(); // Log logout time
    }

    user.refreshToken = null;
    await user.save();

    // Clear cookie with same options to ensure it is removed in browsers
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Logout failed!" });
  }
};

exports.getLoginHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    const user = await User.findById(id).select('loginHistory');
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user.loginHistory);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch login history!" });
  }
};


// backend API
// authController.js

exports.becomeSeller = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    console.log("User ID from Token:", req.user.id); // Log the user ID from the token

    const user = await User.findById(req.user.id);
    if (!user) {
      console.error("User not found in database");
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.role === "seller") {
      console.error("User is already a seller");
      return res.status(400).json({ message: "You are already a seller!" });
    }

    const { storeName, storeDescription, contactNumber, storeAddress } = req.body;

    if (!storeName) {
      console.error("Store name is missing");
      return res.status(400).json({ message: "Store name is required!" });
    }

    // Update user's role and seller details
    user.role = "seller";
    user.sellerDetails = {
      storeName,
      storeDescription,
      contactNumber,
      storeAddress,
    };

    await user.save(); // Save the updated user details
    console.log("User role updated to seller:", user);

    res.json({
      message: "You are now a seller!",
      sellerDetails: user.sellerDetails,
      role: user.role, // Send the updated role
    });
  } catch (error) {
    console.error("Error in becomeSeller:", error); // Log the full error
    res.status(500).json({ message: "Failed to become a seller!" });
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(400).json({ message: "No refresh token" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(400).json({ message: "Invalid refresh token" });

    const newTokens = generateTokens(user);
    user.refreshToken = newTokens.refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("refreshToken", newTokens.refreshToken, cookieOptions);
    res.json({ accessToken: newTokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message || "Token refresh failed!" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -refreshToken'); // Exclude sensitive information
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch users!" });
  }
};

// Get User by ID
// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    const user = await User.findById(id).select('-password -refreshToken'); // Exclude sensitive information
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch user!" });
  }


  
};

// authController.js

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format!" });
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete user!" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email } = req.body;

    // Check if new username/email is already taken by someone else
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "Username already exists" });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email already exists" });
      user.email = email;
    }

    // Handle avatar upload
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.buffer);
      if (uploadResult) {
        user.avatar = uploadResult;
      }
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};