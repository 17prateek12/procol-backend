const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Please add the event name"],
    },
    eventDate:{
      type:Date,
      required:[true, "Please add date"],
    },
    startTime: {
      type: Date,
      required: [true, "Please add the start time"],
    },
    endTime: {
      type: Date,
      required: [true, "Please add the end time"],
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: [true, "Please add the item name"],
        },
        quantity: {
          type: Number,
          required: [true, "Please add the item quantity"],
        },
        dynamicFields: {
          type: Map,
          of: String, // Stores key-value pairs for additional dynamic fields
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);