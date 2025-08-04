const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  testinguser,
  forgotPassword,
  resetPassword,
  updateUserByAdmin,
} = require("../controllers/userController");

const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.get("/test", testinguser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allusers", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);
router.get("/:id", getUserById);
router.put("/update", protect, upload.single("profileImage"), updateUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/:id/admin", protect, admin, updateUserByAdmin);

module.exports = router;
