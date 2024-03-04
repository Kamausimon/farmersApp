const express = require("express");
const reviewController = require("../Controller/reviewController");
const authController = require("../Controller/authController");

const router = express.Router({ mergeParams: true });

router.route("/review").get(reviewController.getAllReviews);
router
  .route("/review")
  .post(
    authController.protectRoute,
    authController.restrictTo("user"),
    reviewController.setProduceUserIds,
    reviewController.createReview
  );

router.route("/review/:id").get(reviewController.getOneReview);
router
  .route("/review/:id")
  .patch(
    authController.protectRoute,
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  );
router
  .route("/review/:id")
  .delete(
    authController.protectRoute,
    authController.restrictTo("admin", "user"),
    reviewController.deleteReview
  );

module.exports = router;
