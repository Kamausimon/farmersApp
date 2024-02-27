const express = require("express");
const produceController = require("../Controller/produceController");
const authController = require("../Controller/authController");

const router = express.Router();

router.route("/").get(produceController.getAllProduce);
router
  .route("/")
  .post(authController.protectRoute, produceController.createNewProduce);

router.route("/:id").get(produceController.getOneProduce);
router
  .route("/:id")
  .patch(
    authController.protectRoute,
    produceController.produceOwnershipConfirmation,
    produceController.updateOneProduce
  );
router
  .route("/:id")
  .delete(
    authController.protectRoute,
    produceController.produceOwnershipConfirmation,
    produceController.deleteProduce
  );

module.exports = router;
