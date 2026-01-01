const mongoose = require('mongoose');

const CareReminderSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },

    type: {
      type: String,
      enum: ['vaccination', 'deworming', 'flea_tick', 'custom'],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'disabled'],
      default: 'pending',
    },

    createdBy: {
      type: String,
      enum: ['system', 'shelter'],
      default: 'system',
    },

    notes: {
      type: String,
      default: '',
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CareReminder', CareReminderSchema);