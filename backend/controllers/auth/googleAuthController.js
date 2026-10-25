import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // 1. Validate Google credential
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // 2. Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = payload.name || email.split("@")[0];

    // 3. Find existing user by Google ID or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // 4. Prevent linking a different Google account
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          success: false,
          message: "This email is associated with another Google account",
        });
      }

      // 5. Link Google account to existing email/password account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      // Google has verified this email
      user.isEmailVerified = true;

      await user.save();
    } else {
      // 6. Create a verified Google user
      user = await User.create({
        name,
        email,
        googleId,
        isEmailVerified: true,
      });
    }

    // 7. Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 8. Set authentication cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // 9. Return successful response
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login failed:", error);

    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};