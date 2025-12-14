const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, enum: ['Dog', 'Cat'], required: true },
  breed: { type: String },
  gender: { type: String, enum: ['Male', 'Female'] },
  age: { years: Number, months: Number },
  size: { type: String, enum: ['Small', 'Medium', 'Large'] },
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  labels: {
    temperament: [String], // e.g., 'Friendly', 'Energetic'
    goodWith: [String]
  },
  adoptionStatus: { type: String, default: 'Available' },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', petSchema);