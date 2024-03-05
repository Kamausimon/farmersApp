const Messages = require("./messageController");
const AppError = require("../utils/AppError");

const fetchMessages = async (Id, res) => {
  try {
    const messages = await Message.find(Id);

    res.status(200).json({
      status: "success",
      data: {
        messages,
      },
    });
  } catch (err) {
    console.log("There was an error");
    next(new AppError("There was an error fetching all the messages", 400));
  }
};

exports.getAdminMessages = async (req, res, next) => {
  const Id = { admin: Admin };
  await fetchMessages(Id, res);
};

exports.getUserMessages = async (req, res, next) => {
  const Id = { user: UserId };
  await fetchMessages(Id, res);
};

exports.getFarmerMessages = async (req, res, next) => {
  const Id = { farmer: farmerId };
  await fetchMessages(Id, res);
};

exports.sendMessage = async (req, res, next) => {
  const 
};

exports.getOneMessage = async (req, res, next) => {};
