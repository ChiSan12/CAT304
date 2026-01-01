const mongoose = require('mongoose');

const petUpdateSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  adopterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adopter', required: true },
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },

  notes: { type: String, required: true },
  weight: String,
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Attention']
  },

  images: [
  {
    data: Buffer,
    contentType: String
  }
]
}, { timestamps: true });

module.exports = mongoose.model('PetUpdate', petUpdateSchema);