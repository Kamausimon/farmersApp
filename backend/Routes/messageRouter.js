const express = require("express");
const messageController = require("../Controller/messageController");

const router = express.Router();

router.route("/message").get(messageController.getAdminMessages);
router.route("/message").get(messageController.getUserMessages);
router.route("/message").get(messageController.getFarmerMessages);

router.post("/message").post(messageController.newMessage);

//get message by id
router.route("/message/:id").get(messageController.getOneMessage);

module.exports = router;
