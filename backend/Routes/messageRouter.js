const express = require("express");
const messageController = require("../Controller/messageController");

const router = express.Router({ mergeParams: true });

router.route("/").get(messageController.getAdminMessages);
router.route("/").get(messageController.getUserMessages);
router.route("/").get(messageController.getFarmerMessages);

router.post("/").post(messageController.newMessage);

//get message by id
router.route("/:id").get(messageController.getOneMessage);

//allow user to delete message
router.route("/:id").delete(messageController.deleteMessage);

module.exports = router;
