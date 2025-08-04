const Contact = require("../models/contactModel");
const sendEmail = require("../utils/sendEmail");

// send contact message from user
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Send email confirmation to user
    await sendEmail(
      email,
      "Rick Dresses - Contact Received",
      `Dear ${name},\n\nThank you for contacting Rick Dresses. Our team will respond to your message very soon.\n\nMessage:\n"${message}"\n\nRegards,\nRick Dresses Team`
    );

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("❌ Error in sendMessage:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ 1. GET all contact messages (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch contacts", error: err.message });
  }
};

// ✅ 2. DELETE a contact message (admin only)
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete contact", error: err.message });
  }
};

// ✅ 3. Admin reply to user
exports.replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    // Send email reply
    await sendEmail(
      contact.email,
      "Reply from Rick Dresses",
      `Dear ${contact.name},\n\n${replyMessage}\n\nRegards,\nRick Dresses Team`
    );

    contact.replied = true;
    contact.replyMessage = replyMessage;
    await contact.save();

    res.status(200).json({ message: "Reply sent and saved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reply", error: err.message });
  }
};
