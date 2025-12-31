const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  //Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true
  },

  species: { 
    type: String, 
    enum: ['Dog', 'Cat'], 
    required: true 
  },

  breed: {
    type: String,
    trim: true
  },

  gender: { 
    type: String, 
    enum: ['Male', 'Female'],
    required: true
  },

  age: { 
    years: { 
      type: Number, 
      min: 0,
      default: 0
    }, 
    months: { 
      type: Number, 
      min: 0, 
      max: 11,
      default: 0
    } 
  },

  size: { 
    type: String, 
    enum: ['Small', 'Medium', 'Large'],
    required: true
  },

  // Associated Shelter
  shelterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shelter',
    required: true
  },

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String
  }],

  // Labels (used for matching algorithms)
  labels: {
    temperament: {
      type: [String],
      enum: ['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'],
      default: []
    },
    goodWith: {
      type: [String],
      enum: ['Children', 'Other Dogs', 'Other Cats', 'Elderly', 'Single Adults'],
      default: []
    }
  },

  // Health Status
  healthStatus: {
    vaccinated: {
      type: Boolean,
      default: false
    },
    neutered: {
      type: Boolean,
      default: false
    },
    medicalConditions: {
      type: [String],
      default: []
    },
    lastVetVisit: Date,
    nextVaccinationDue: Date
  },

  // Vaccination History
  vaccinationHistory: [{
    vaccineName: String,
    dateAdministered: Date,
    nextDue: Date,
    veterinarian: String
  }],

  // Adoption Status
  adoptionStatus: { 
    type: String, 
    enum: ['Available', 'Pending', 'Adopted'],
    default: 'Available' 
  },

  // If adopted, store adopter reference
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adopter'
  },
  
  adoptionDate: Date,

  // Description 
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Special Needs 
  specialNeeds: {
    type: String,
    trim: true
  },

  // Behaviour Notes (for internal shelter use)
  behaviorNotes: {
    type: String,
    trim: true
  }

}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes for performance optimisation
petSchema.index({ adoptionStatus: 1 });
petSchema.index({ species: 1, size: 1 });
petSchema.index({ shelterId: 1 });

// Virtual field: calculate full age string
petSchema.virtual('fullAge').get(function() {
  const years = this.age.years || 0;
  const months = this.age.months || 0;
  
  if (years === 0) return `${months} months old`;
  if (months === 0) return `${years} years old`;
  return `${years} years ${months} months old`;
});

// Method: check if vaccination reminder is needed
petSchema.methods.needsVaccinationReminder = function() {
  if (!this.healthStatus.nextVaccinationDue) return false;
  
  const today = new Date();
  const dueDate = new Date(this.healthStatus.nextVaccinationDue);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  // Returns true if vaccination is due within the next 7 days
  return daysUntilDue <= 7 && daysUntilDue >= 0;
};

// Method: get pet summary for list views
petSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    species: this.species,
    breed: this.breed,
    size: this.size,
    age: this.fullAge,
    image: this.images[0]?.url,
    status: this.adoptionStatus,
    temperament: this.labels.temperament
  };
};

module.exports = mongoose.models.Pet || mongoose.model('Pet', petSchema);