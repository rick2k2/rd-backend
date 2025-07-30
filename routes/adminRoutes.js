const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middlewares/authMiddleware");

const { getAdminStats } = require("../controllers/adminController");

router.get("/stats", protect, admin, getAdminStats);

module.exports = router;
