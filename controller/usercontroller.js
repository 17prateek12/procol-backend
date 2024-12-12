const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../models/userModel.js')

// User Schema and Model


// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;
  
    if (!email || !name || !password) {
      res.status(400);
      throw new Error("All fields are mandatory");
    }
  
    const userAvailable = await User.findOne({ email });
  
    if (userAvailable) {
      res.status(400);
      throw new Error("User Already Exist");
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);
  
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
  
    console.log(`User Created ${user}`);
  
    if (user) {
      // Generate a JWT token
      const accessToken = jwt.sign(
        {
          user: {
            name: user.name,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
  
      res.status(201).json({
        _id: user.id,
        email: user.email,
        token: accessToken, // Include the token in the response
      });
    } else {
      throw new Error("User data is not valid");
    }
  });

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          name: user.name,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ accessToken, user });
  } else {
    res.status(401);
    throw new Error("Email or password is invalid");
  }
});

// Current User
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
};
