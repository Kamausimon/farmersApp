const Messages = require("./messageController");
const AppError = require("../utils/AppError");

exports.getAllMessages = async (req, res, next) => {
  const messages = await Messages.find({ user: userId });
};

exports.sendMessage = async (req, res, next) => {};

exports.getOneMessage = async (req, res, next) => {};
