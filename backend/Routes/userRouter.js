const express = require("express");
const userController = require("../Controller/userController");
const authController = require("../Controller/authController");

const router = express.Router();

router.route("/").post(authController.signUp);

router.route("/").get(userController.getAllUsers);
router.route("/").post(userController.createNewUser);

router.route("/:id").get(userController.getOneUser);
router.route("/:id").patch(userController.updateUserDetails);
router.route("/:id").delete(userController.deleteUser);

module.exports = router;
