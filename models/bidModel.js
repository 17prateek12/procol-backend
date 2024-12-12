const mongoose = require("mongoose");

const bidSchema = mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", // Reference to the Event model
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    bids: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        amounts: {
          type: [Number], // Array of bid amounts
          required: [true, "Please add bid amounts for the item"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bid", bidSchema);
