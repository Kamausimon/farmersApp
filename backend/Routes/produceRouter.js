const express = require("express");
const produceController = require("../Controller/produceController");
const authController = require("../Controller/authController");

const router = express.Router();

router.route("/").get(produceController.getAllProduce);
router
  .route("/")
  .post(
    authController.protectRoute,
    authController.restrictTo("farmer", "admin"),
    produceController.createNewProduce
  );

router.route("/:id").get(produceController.getOneProduce);
router
  .route("/:id")
  .patch(
    authController.protectRoute,
    authController.restrictTo("admin", "farmer"),
    produceController.updateOneProduce
  );
router
  .route("/:id")
  .delete(
    authController.protectRoute,
    authController.restrictTo("admin", "farmer"),
    produceController.deleteProduce
  );

module.exports = router;
