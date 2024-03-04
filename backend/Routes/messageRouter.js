const express = require("express");
const messageController = require("../Controller/messageController");

const router = express.Router();

router.route("/message").get(messageController.getAllMessage);
router.post("/message").post(messageController.sendMessage);

//get message by id
router.route("/message/:id").get(messageController.getOneMessage);

module.exports = router;
