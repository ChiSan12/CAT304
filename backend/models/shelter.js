const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  location: {
    address: String,
    city: String,
    state: String
  },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }]
});

module.exports = mongoose.model('Shelter', shelterSchema);
