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
}, { timestamps: true }); // <-- automatically adds createdAt and updatedAt

module.exports = mongoose.model('Report', reportSchema);
