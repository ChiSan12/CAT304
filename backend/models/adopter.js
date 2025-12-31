const mongoose = require('mongoose');

/**
 * Adopter Schema Definition
 * This model stores all information related to pet adopters
 * Includes: authentication, profile details, preferences, and adoption history
 */

const adopterSchema = new mongoose.Schema({
  // === Authentication Fields ===
  username: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  
  // === Personal Profile Information ===
  fullName: { 
    type: String,
    trim: true
  },
  phone: { 
    type: String,
    trim: true,
    match: [/^\+601\d{8}$/, 'Invalid Malaysia phone number format (should be +60XXXXXXXXX)']
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String }
  },
  
  // === Adoption Preferences (for AI Matching) ===
  preferences: {
    // Preferred pet characteristics
    preferredSize: { 
      type: [String], 
      enum: ['Small', 'Medium', 'Large'],
      default: []
    },
    preferredAge: {
      type: [String],
      enum: ['Puppy', 'Young', 'Adult', 'Senior'],
      default: []
    },
    preferredTemperament: {
      type: [String],
      enum: ['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'],
      default: []
    },
    
    // Living situation
    hasGarden: { 
      type: Boolean, 
      default: false 
    },
    hasOtherPets: { 
      type: Boolean, 
      default: false 
    },
    hasChildren: {
      type: Boolean,
      default: false
    },
    experienceLevel: {
      type: String,
      enum: ['First-time', 'Some Experience', 'Experienced'],
      default: 'First-time'
    }
  },

  // === Adoption Request History ===
  adoptionRequests: [{
    petId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Pet' // Reference to Pet model
    },
    requestDate: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    shelterResponse: {
      message: String,
      respondedAt: Date
    }
  }],

  // === Adopted Pets ===
  adoptedPets: [{
    petId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Pet'
    },
    adoptionDate: { 
      type: Date, 
      default: Date.now 
    }
  }],

  // === Account Status ===
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // === Timestamps ===
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});


/**
 * Method to get adopter's basic info (excluding sensitive data)
 */
adopterSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    preferences: this.preferences,
    adoptedPetsCount: this.adoptedPets.length
  };
};

module.exports = mongoose.model('Adopter', adopterSchema);
