const mongoose = require("mongoose");

const VeterinaryClinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  }
});

// Geo index (
VeterinaryClinicSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
  "VeterinaryClinic",
  VeterinaryClinicSchema
);
