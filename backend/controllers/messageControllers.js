import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//@description     Create New Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res
      .status(400)
      .json({ message: "Invalid data passed into request" });
  }

  try {
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Use ES Module export
export { allMessages, sendMessage };
