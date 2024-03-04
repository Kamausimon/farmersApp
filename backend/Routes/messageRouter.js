const express = require("express");
const messageController = require("../Controller/messageController");

const router = express.Router();

router.route("/message").module.exports = router;
