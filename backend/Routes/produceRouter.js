const express = require("express");
const produceController = require("../Controller/produceController");

const router = express.Router();

router.route("/").get(produceController.getAllProduce);
router.route("/").post(produceController.createNewProduce);

router.route("/:id").get(produceController.getOneProduce);
router.route("/:id").patch(produceController.updateOneProduce);
router.route("/:id").delete(produceController.deleteProduce);

module.exports = router;
