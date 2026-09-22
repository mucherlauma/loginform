
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  createClient
} = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// SERVER CHECK

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Login API is running"
  });
});

// CREATE ACCOUNT

app.post("/api/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const { data, error } =
      await supabase.auth.signUp({

        email,
        password,

        options: {
          data: {
            name
          }
        }

      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: data.session
        ? "Account created successfully"
        : "Check your email to confirm your account",
      user: data.user,
      session: data.session
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

// LOGIN

app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: data.user,
      session: data.session
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

// GET LOGGED-IN USER

app.get("/api/me", async (req, res) => {

  const token =
    req.headers.authorization?.replace(
      /^Bearer\s+/i,
      ""
    );

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const { data, error } =
    await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }

  res.json({
    success: true,
    user: data.user
  });

});

// START SERVER

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
