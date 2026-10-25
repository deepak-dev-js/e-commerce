import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import sendEmail from "../../services/emailService.js";

export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // 6. Hash OTP before storing it
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // 7. Set OTP expiry to 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 8. Create unverified user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpires: otpExpiry,
    });

    // 9. Send verification OTP
    try {
      await sendEmail({
        to: "deepakgupta757600@gmail.com",
        subject: "Verify your ApnaShop email",
        text: `Hello ${user.name},

Welcome to ApnaShop!

Your email verification OTP is: ${otp}

This OTP expires in 10 minutes.

If you did not create this account, you can ignore this email.

ApnaShop Team`,
      });
    } catch (error) {
      console.error("Verification email failed:", error);

      // Remove the user if the verification email could not be sent
      await User.deleteOne({ _id: user._id });

      return res.status(503).json({
        success: false,
        code: "VERIFICATION_EMAIL_FAILED",
        message:
          "We could not send the verification email. Please try registering again.",
      });
    }

    // 10. Ask frontend to navigate to OTP screen
    return res.status(201).json({
      success: true,
      code: "EMAIL_VERIFICATION_REQUIRED",
      message: "Registration successful. Please verify your email.",
      email: user.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Validate input
    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 2. Find the user and explicitly select hidden OTP fields
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+emailVerificationOTP +emailVerificationOTPExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check whether the email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // 4. Check whether an OTP exists
    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please request a new OTP.",
      });
    }

    // 5. Check OTP expiry
    if (user.emailVerificationOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // 6. Hash the entered OTP
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    // 7. Compare the entered OTP with the stored hash
    if (hashedOTP !== user.emailVerificationOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 8. Verify email and clear OTP fields
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;

    await user.save();

    // Generate JWT
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

// Set HTTP-only cookie for web.
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
});

return res.status(200).json({
  success: true,
  message: "Email verified successfully. You are now logged in.",
  token, // Native app needs this to save the JWT.
  user: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
  } catch (error) {
    console.error("Email verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CREDENTIALS",
        message: "Email and password are required.",
      });
    }

    // 2. Find user by email
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // 3. Check whether user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No account found with this email.",
      });
    }

        // Check whether email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in.",
      });
    }

    // 4. Check whether the stored password exists
    if (!user.password) {
      return res.status(400).json({
        success: false,
        code: "PASSWORD_NOT_SET",
        message: "This account uses Google login. Please sign in with Google.",
      });
    }



    // 5. Compare submitted password with stored password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        code: "INVALID_PASSWORD",
        message: "Incorrect password. Please try again.",
      });
    }

    // 6. Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 7. Set authentication cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // 8. Return successful response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[LOGIN ERROR] Login controller failed:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Use the same response whether the account exists or not
    const genericMessage =
      "If an account exists with this email, you will receive password reset instructions.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    // Generate a cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the token hash in MongoDB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // TODO: Replace this URL with your actual reset-password page
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your ApnaShop Password",
        text: `Hello ${user.name},

We received a request to reset your ApnaShop password.

Open this link to set a new password:
${resetUrl}

This link expires in 15 minutes and can only be used once.

If you did not request this, you can ignore this email.

ApnaShop Team`,
      });
    } catch (emailError) {
      // Clear the unused token if sending the email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error("Password reset email failed:", emailError);

      return res.status(500).json({
        success: false,
        message: "Unable to send the reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Hash the token received from the user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the matching user with a valid, unexpired token
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The reset link is invalid or has expired.",
      });
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(password, 12);

    // Make the reset token single-use
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your email and password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again.",
    });
  }
};
