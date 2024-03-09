const express = require("express");
const reviewController = require("../Controller/reviewController");
const authController = require("../Controller/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protectRoute, reviewController.getAllReviews);
router
  .route("/")
  .post(
    authController.protectRoute,
    authController.restrictTo("user"),
    reviewController.setProduceUserIds,
    reviewController.createReview
  );

router.route("/:id").get(reviewController.getOneReview);
router
  .route("/:id")
  .patch(
    authController.protectRoute,
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  );
router
  .route("/:id")
  .delete(
    authController.protectRoute,
    authController.restrictTo("admin", "user"),
    reviewController.deleteReview
  );

module.exports = router;
