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
} = require("../controllers/userController");

const { protect, admin } = require("../middlewares/authMiddleware");

router.get("/test", testinguser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allusers", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);
router.get("/:id", getUserById);
router.put("/:id", protect, admin, updateUser);

// router.post("/forgot-password", protect, forgotPassword);

module.exports = router;
