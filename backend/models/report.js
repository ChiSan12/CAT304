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
  photoUrl: { type: Buffer }, // optional
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adopter',
    required: true, // ensures we always have an adopter
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
