const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "ไม่มีสิทธิ์เข้าถึง! เฉพาะ Admin เท่านั้น" });
  }
  next();
};

router.get(
  "/",
  authMiddleware.verifyToken,
  isAdmin,
  userController.getAllUsers,
);
router.put(
  "/:id/role",
  authMiddleware.verifyToken,
  isAdmin,
  userController.updateUserRole,
);

module.exports = router;
