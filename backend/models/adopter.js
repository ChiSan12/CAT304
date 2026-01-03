const mongoose = require('mongoose');

/**
 * Adopter Schema Definition
 * This model stores all information related to pet adopters
 * Includes: authentication, profile details, preferences, and adoption history
 */

const adopterSchema = new mongoose.Schema({
  // === Authentication Fields ===
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
    required: [true, 'Full name is required'],  //  Added required validation
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],  
    validate: {
      validator: function(v) {
        // Allow letters (any language), spaces, hyphens, apostrophes, and dots
        return /^[\p{L}\s\-'.]+$/u.test(v);
      },
      message: 'Full name can only contain letters, spaces, hyphens, apostrophes, and dots'
    }
  },
  phone: { 
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+601\d{8}$/, 'Invalid Malaysia phone number format (should be +60XXXXXXXXX)']
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String }
  },
  
  // === Adoption Preferences (for Smart Pet Matching) ===
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
  }
},
  
   {
  timestamps: true // Automatically manage createdAt and updatedAt
});


/**
 * Method to get adopter's basic info (excluding sensitive data)
 */
adopterSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    preferences: this.preferences,
    adoptedPetsCount: this.adoptedPets.length
  };
};

module.exports = mongoose.models.Adopter || mongoose.model('Adopter', adopterSchema);
