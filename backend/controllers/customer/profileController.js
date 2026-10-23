import User from "../../models/User.js";

export const getMyProfile = async (req, res) => {
  try {

    //This assumes your authentication middleware sets the logged-in user on req.user
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to fetch customer profile:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer profile.",
    });
  }
};