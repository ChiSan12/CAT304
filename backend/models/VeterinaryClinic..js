const mongoose = require("mongoose");

const VeterinaryClinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,

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

// Geo index (VERY IMPORTANT)
VeterinaryClinicSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
  "VeterinaryClinic",
  VeterinaryClinicSchema
);
