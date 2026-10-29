import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    readByAdmin: {
      type: Boolean,
      default: false,
    },

    readByCustomer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    messages: [messageSchema],

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    unreadByAdmin: {
      type: Number,
      default: 0,
    },

    unreadByCustomer: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;