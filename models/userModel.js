const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: function () {
        // Default: placeholder with first letter
        const initial = this.name?.charAt(0).toUpperCase() || "U";
        return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
      },
    },
    resetToken: String,
    resetTokenExpire: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
