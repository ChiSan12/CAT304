const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  animalType: { type: String, required: true },
  number: { type: Number, required: true },
  condition: { type: String, required: true },
  animalDesc: { type: String, required: true },
  placeDesc: { type: String, required: true },
  pin: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  photoUrl: { type: Buffer }, // stored as buffer
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adopter',
    required: true,
  },
  // --- ADDED THIS FIELD ---
  status: {
    type: String,
    enum: ['Pending', 'Investigating', 'Rescued', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);