const express = require('express');
const router = express.Router();
const Adopter = require('../models/adopter');
const Pet = require('../models/pet');

// AUTHENTICATION ROUTES

/**
 * POST /api/adopters/register
 * Register a new adopter account
 * Body: { username, email, password, fullName, phone }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Username, email, and password are required" 
      });
    }

    // Check if email already exists
    const existingEmail = await Adopter.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Check if username already exists
    const existingUsername = await Adopter.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: "Username already taken" 
      });
    }

    // Create new adopter
    const newAdopter = new Adopter({
      username,
      email,
      password, // TODO: Hash password in production (use bcrypt)
      fullName,
      phone
    });

    await newAdopter.save();

    res.status(201).json({ 
      success: true,
      message: "Registration successful! 🎉",
      adopter: newAdopter.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration",
      error: error.message 
    });
  }
});

/**
 * POST /api/adopters/login
 * Login for existing adopter
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find adopter by email
    const adopter = await Adopter.findOne({ email });
    
    if (!adopter) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check password (in production, use bcrypt.compare)
    if (adopter.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check if account is active
    if (!adopter.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Account has been deactivated" 
      });
    }

    res.json({ 
      success: true,
      message: "Login successful! ✅",
      adopter: adopter.getPublicProfile(),
      adopterId: adopter._id
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: error.message 
    });
  }
});

// PROFILE MANAGEMENT ROUTES

/**
 * GET /api/adopters/:id
 * Get adopter profile by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const adopter = await Adopter.findById(req.params.id)
      .populate('adoptionRequests.petId')
      .populate('adoptedPets.petId');

    if (!adopter) {
      return res.status(404).json({ 
        success: false,
        message: "Adopter not found" 
      });
    }

    res.json({ 
      success: true,
      adopter: adopter.getPublicProfile(),
      adoptionRequests: adopter.adoptionRequests,
      adoptedPets: adopter.adoptedPets
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error retrieving profile",
      error: error.message 
    });
  }
});

/**
 * PUT /api/adopters/:id
 * Update adopter profile
 * Body: { fullName, phone, address, preferences }
 */
router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, address, preferences } = req.body;

    const updatedAdopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      { 
        fullName, 
        phone, 
        address, 
        preferences,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedAdopter) {
      return res.status(404).json({ 
        success: false,
        message: "Adopter not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Profile updated successfully ✅",
      adopter: updatedAdopter.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error updating profile",
      error: error.message 
    });
  }
});

// PET BROWSING & SEARCH ROUTES

/**
 * GET /api/adopters/pets/all
 * Get all available pets for browsing
 * Query params: ?species=Dog&size=Medium&temperament=Friendly
 */
router.get('/pets/all', async (req, res) => {
  try {
    const { species, size, temperament, age } = req.query;
    
    // Build filter object
    let filter = { adoptionStatus: 'Available' };
    
    if (species) filter.species = species;
    if (size) filter.size = size;
    if (temperament) filter['labels.temperament'] = temperament;
    if (age) filter['labels.ageGroup'] = age;

    const pets = await Pet.find(filter)
      .populate('shelterId', 'name location')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      count: pets.length,
      pets 
    });

  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error retrieving pets",
      error: error.message 
    });
  }
});

/**
 * GET /api/adopters/pets/:petId
 * Get detailed information about a specific pet
 */
router.get('/pets/:petId', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId)
      .populate('shelterId', 'name email phone location');

    if (!pet) {
      return res.status(404).json({ 
        success: false,
        message: "Pet not found" 
      });
    }

    res.json({ 
      success: true,
      pet 
    });

  } catch (error) {
    console.error('Get pet details error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error retrieving pet details",
      error: error.message 
    });
  }
});

/**
 * POST /api/adopters/pets/match
 * Get AI-matched pets based on adopter preferences
 * Body: { adopterId }
 */
router.post('/pets/match', async (req, res) => {
  try {
    const { adopterId } = req.body;

    // Get adopter preferences
    const adopter = await Adopter.findById(adopterId);
    if (!adopter) {
      return res.status(404).json({ 
        success: false,
        message: "Adopter not found" 
      });
    }

    // Get all available pets
    const availablePets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location');

    // Calculate compatibility scores
    const petsWithScores = availablePets.map(pet => {
      let score = 0;
      const prefs = adopter.preferences;

      // Match size preference
      if (prefs.preferredSize.includes(pet.size)) {
        score += 25;
      }

      // Match temperament
      const matchingTemperaments = pet.labels.temperament.filter(t => 
        prefs.preferredTemperament.includes(t)
      );
      score += matchingTemperaments.length * 15;

      // Living situation compatibility
      if (prefs.hasChildren && pet.labels.goodWith.includes('Children')) {
        score += 15;
      }
      if (prefs.hasOtherPets && pet.labels.goodWith.includes('Other Dogs')) {
        score += 15;
      }
      if (prefs.hasGarden && pet.labels.temperament.includes('Energetic')) {
        score += 10;
      }

      // Experience level
      if (prefs.experienceLevel === 'First-time' && 
          pet.labels.trainingStatus === 'Well Trained') {
        score += 10;
      }

      return {
        ...pet.toObject(),
        compatibilityScore: Math.min(score, 100) // Cap at 100%
      };
    });

    // Sort by compatibility score (highest first)
    petsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({ 
      success: true,
      message: "AI matching completed ✅",
      count: petsWithScores.length,
      pets: petsWithScores
    });

  } catch (error) {
    console.error('Pet matching error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error during pet matching",
      error: error.message 
    });
  }
});


// ADOPTION REQUEST ROUTES

/**
 * POST /api/adopters/:adopterId/request
 * Submit adoption request for a pet
 * Body: { petId }
 */
router.post('/:adopterId/request', async (req, res) => {
  try {
    const { adopterId } = req.params;
    const { petId } = req.body;

    // Verify adopter exists
    const adopter = await Adopter.findById(adopterId);
    if (!adopter) {
      return res.status(404).json({ 
        success: false,
        message: "Adopter not found" 
      });
    }

    // Verify pet exists and is available
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ 
        success: false,
        message: "Pet not found" 
      });
    }

    if (pet.adoptionStatus !== 'Available') {
      return res.status(400).json({ 
        success: false,
        message: "This pet is no longer available for adoption" 
      });
    }

    // Check if already requested
    const existingRequest = adopter.adoptionRequests.find(
      req => req.petId.toString() === petId && req.status === 'Pending'
    );

    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        message: "You have already requested to adopt this pet" 
      });
    }

    // Add request to adopter's history
    adopter.adoptionRequests.push({
      petId: petId,
      status: 'Pending',
      requestDate: Date.now()
    });

    await adopter.save();

    res.status(201).json({ 
      success: true,
      message: "Adoption request submitted successfully! 📝",
      request: adopter.adoptionRequests[adopter.adoptionRequests.length - 1]
    });

  } catch (error) {
    console.error('Adoption request error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error submitting adoption request",
      error: error.message 
    });
  }
});

/**
 * GET /api/adopters/:adopterId/requests
 * Get all adoption requests for an adopter
 */
router.get('/:adopterId/requests', async (req, res) => {
  try {
    const adopter = await Adopter.findById(req.params.adopterId)
      .populate({
        path: 'adoptionRequests.petId',
        populate: { path: 'shelterId', select: 'name email phone' }
      });

    if (!adopter) {
      return res.status(404).json({ 
        success: false,
        message: "Adopter not found" 
      });
    }

    res.json({ 
      success: true,
      requests: adopter.adoptionRequests
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error retrieving requests",
      error: error.message 
    });
  }
});

/**
 * DELETE /api/adopters/:adopterId/request/:petId
 * Cancel an existing adoption request
 */
router.delete('/:adopterId/request/:petId', async (req, res) => {
  try {
    const { adopterId, petId } = req.params;

    const adopter = await Adopter.findById(adopterId);
    if (!adopter) {
      return res.status(404).json({ success: false, message: "Adopter not found" });
    }

    // 找到并移除那个 request
    // 我们用 filter 把不等于这个 petId 的留下来，等于的就被删掉了
    const initialLength = adopter.adoptionRequests.length;
    adopter.adoptionRequests = adopter.adoptionRequests.filter(
      req => req.petId.toString() !== petId
    );

    if (adopter.adoptionRequests.length === initialLength) {
        return res.status(400).json({ success: false, message: "Request not found" });
    }

    await adopter.save();

    res.json({ 
      success: true, 
      message: "Request cancelled successfully" 
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;