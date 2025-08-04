const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getAllContacts,
  deleteContact,
  replyToContact,
} = require("../controllers/contactController");

const { admin, protect } = require("../middlewares/authMiddleware");

// ✅ Public
router.post("/", sendMessage);

// ✅ Admin-only routes
router.get("/", getAllContacts);
router.delete("/:id", deleteContact);
router.put("/:id/reply", replyToContact);

module.exports = router;
