const mongoose = require("mongoose");

/**
 * Care Reminder Schema
 * This model tracks post-adoption care activities for adopted pets.
 * Reminders are created automatically based on shelter-defined rules
 * or manually by shelter admins.
 */

const careReminderSchema = new mongoose.Schema(
  {
    /* ================= RELATIONSHIPS ================= */

    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true
    },

    adopterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adopter",
      required: true
    },

    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true
    },

    /* ================= REMINDER CONTENT ================= */

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "Vaccination",
        "Health Check"
      ],
      required: true
    },

    /* ================= SCHEDULING ================= */

    dueDate: {
      type: Date,
      required: true
    },

    /* ================= STATUS TRACKING ================= */

    status: {
      type: String,
      enum: ["Pending", "Completed", "Overdue"],
      default: "Pending"
    },

    completedAt: {
      type: Date
    },

    /* ================= CONTROL & SOURCE ================= */

    createdBy: {
      type: String,
      enum: ["System", "Shelter"],
      default: "System"
    },

    updatedBy: {
      type: String,
      enum: ["Shelter", "System"],
      default: "System"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.CareReminder ||
  mongoose.model("CareReminder", careReminderSchema);