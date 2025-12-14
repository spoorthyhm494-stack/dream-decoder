import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ---------------------- REGISTER ----------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password, // will be hashed in User model pre-save hook
    });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- LOGIN ----------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- LOGOUT ----------------------
export const logoutUser = (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful. Please remove token from frontend storage.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- UPDATE PROFILE ----------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email: email?.trim().toLowerCase() },
      { new: true }
    );

    res.json({ message: "Profile updated", user: updated });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- UPDATE PASSWORD ----------------------
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const valid = await user.matchPassword(currentPassword);
    if (!valid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = newPassword; // will be hashed automatically
    await user.save();

    res.json({ message: "Password updated" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- UPDATE THEME ----------------------
export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true }
    );

    res.json({ message: "Theme updated", user: updated });
  } catch (error) {
    console.error("Theme Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
