const mongoose = require("mongoose");

const ReminderTemplateSchema = new mongoose.Schema({
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shelter",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["Vaccination", "Health Check"],
    required: true
  },

  daysAfterAdoption: {
    type: Number,
    required: true
  },

  description: String,

  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("ReminderTemplate", ReminderTemplateSchema);