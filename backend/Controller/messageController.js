const Messages = require("../Model/messageModel");
const AppError = require("../utils/AppError");
const app = require("../App");
const http = require("http").Server(app);
const io = require("socket.io")(http);

//store user sockets
const userSockets = {};

//check the connectivity
io.on("connection", (socket) => {
  //when a user connects store their socket
  socket.on("userConnected", (Id) => {
    userSockets[Id] = socket.id;
  });
  //when user disconects remove the socket
  socket.on("disconnect", () => {
    delete userSockets[socket.id];
  });
});

const fetchMessages = async (Id, res) => {
  try {
    const messages = await Messages.find(Id).where({ visible: true });

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

exports.newMessage = async (req, res, next) => {
  try {
    //extract info from the request body
    const { Id, content } = req.body;

    //use that info to create a new message body and await as you save to the db
    const newMessage = await Messages.create({ Id, content });

    if (userSockets[Id]) {
      io.to(userSockets[Id]).emit("message", newMessage);
    }

    req.message = newMessage;
    next();
  } catch (err) {
    console.log("There was an error creating the message", err);
    next(new AppError("An error occurred while creating the message", 400));
  }
};

exports.getOneMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Messages.findById(id).where({ visible: true });
    //if message not found
    if (!message) {
      return res.status(400).json({
        status: "fail",
        message: "Message not found",
      });
    }
    res.message = message;
    next();
  } catch (err) {
    console.log("There was an error fetching the message", err);
    next(new AppError(" an error occurred while fetching the message", 404));
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    //find the id from the incoming parameter
    const { id } = req.params;
    const message = Messages.findByIdAndDelete(id);

    //if not found?
    if (!message) {
      return res.status(400).send({ error: "The message was not found" });
    }

    //if the message is present set it as invisible in the database
    message.visible = false;
    await message.save();
    //send a response back to the client
    res.status(200).json({
      status: "sucess",
      data: null,
      message: "message deleted successsfuly",
    });
  } catch (err) {
    console.log("there was an error deleting the message", err);
    next(new AppError("an error occurred while making the deletion", 400));
  }
};
