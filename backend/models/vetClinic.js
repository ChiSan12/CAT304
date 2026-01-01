const mongoose = require('mongoose');

const vetClinicSchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.models.VetClinic
  || mongoose.model('VetClinic', vetClinicSchema);