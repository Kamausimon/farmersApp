const express = require("express");
const userController = require("../Controller/userController");
const authController = require("../Controller/authController");

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
router
  .route("/updatePassword")
  .patch(authController.protectRoute, authController.updatePassword);

router.route("/").get(userController.getAllUsers);
router.route("/").post(userController.createNewUser);

router.route("/:id").get(userController.getOneUser);
router.route("/:id").patch(userController.updateUserDetails);
router.route("/:id").delete(userController.deleteUser);

module.exports = router;
