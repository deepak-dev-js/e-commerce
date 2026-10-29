import Chat from "../models/Chat.js";

// Customer: Get or create their support conversation
export const getMyChat = async (req, res) => {
  try {
    let chat = await Chat.findOne({
      customer: req.user._id,
    }).populate("customer", "name email");

    if (!chat) {
      chat = await Chat.create({
        customer: req.user._id,
      });

      chat = await Chat.findById(chat._id).populate(
        "customer",
        "name email"
      );
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load chat",
    });
  }
};

// Admin: Get all customer conversations
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("customer", "name email")
      .sort({ lastMessageAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load customer chats",
    });
  }
};

// Admin: Get one customer's conversation
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("customer", "name email");

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load conversation",
    });
  }
};