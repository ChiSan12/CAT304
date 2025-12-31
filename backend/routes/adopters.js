const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const Adopter = require('../models/adopter');
const Pet = require('../models/pet');
const Shelter = require('../models/shelter');

//1. Register New User
router.post('/register', async (req, res) => {
  try {
    const {email, password, fullName, phone } = req.body;

    // Check if user already exists (by email)
    const existingUser = await Adopter.findOne({ 
      $or: [{ email }] 
    });
    
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Hash password before saving 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new adopter account
    const newAdopter = new Adopter({
      email,
      password: hashedPassword, // Store hashed password
      fullName,
      phone
    });

    await newAdopter.save();

    res.json({ 
      success: true, 
      message: 'Registration successful!' 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

//2. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const adopter = await Adopter.findOne({ email });
    
    if (!adopter) {
      return res.json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, adopter.password);
    
    if (!isPasswordValid) {
      return res.json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Prepare user data (exclude password)
    const adopterData = {
      id: adopter._id,
      email: adopter.email,
      fullName: adopter.fullName,
      phone: adopter.phone,
      preferences: adopter.preferences
    };

    res.json({ 
      success: true, 
      message: 'Login successful',
      adopter: adopterData,
      adopterId: adopter._id 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// 3. Get All Available Pets (Browse Pets)
router.get('/pets/all', async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location phone email') // Populate shelter info
      .sort({ createdAt: -1 }); // Latest pets first

    res.json({ 
      success: true, 
      pets 
    });
  } catch (error) {
    console.error('Fetch Pets Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pets' 
    });
  }
});

// 4. Rule-based Intelligent Pet Matching
router.post('/pets/match', async (req, res) => {
  try {
    const { adopterId } = req.body;

    // Fetch adopter preferences
    const adopter = await Adopter.findById(adopterId);
    if (!adopter) {
      return res.json({ success: false, message: 'Adopter not found' });
    }

    const prefs = adopter.preferences;

    // Fetch all available pets
    const allPets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location phone email');

    // Calculate compatibility score for each pet
    const petsWithScores = allPets.map(pet => {
      let score = 0;
      let maxScore = 0;

      // 1. Size matching (30 points)
      maxScore += 30;
      if (prefs.preferredSize.includes(pet.size)) {
        score += 30;
      }

      // 2. Temperament matching (40 points)
      maxScore += 40;
      const matchingTemperaments = pet.labels.temperament.filter(t => 
        prefs.preferredTemperament.includes(t)
      );
      score += (matchingTemperaments.length / Math.max(prefs.preferredTemperament.length, 1)) * 40;

      // 3. Living environment matching (30 points)
      maxScore += 30;
      
      // Suitable for children
      if (prefs.hasChildren && pet.labels.goodWith.includes('Children')) {
        score += 10;
      }
      
      // Suitable for other pets
      if (prefs.hasOtherPets && pet.labels.goodWith.includes('Other Dogs')) {
        score += 10;
      }

      // Large pets require garden space
      if (pet.size === 'Large' && prefs.hasGarden) {
        score += 10;
      }

      // Final compatibility score as percentage
      const compatibilityScore = Math.round((score / maxScore) * 100);

      return {
        ...pet.toObject(),
        compatibilityScore
      };
    });

    // Sort pets by compatibility score (highest first)
    petsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({ 
      success: true, 
      pets: petsWithScores 
    });
  } catch (error) {
    console.error('AI Matching Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI matching failed' 
    });
  }
});

// 5. Submit Adoption Request
router.post('/:adopterId/request', async (req, res) => {
  try {
    const { adopterId } = req.params;
    const { petId } = req.body;

    // Check whether the pet still exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.json({ 
        success: false, 
        message: 'Pet not found' 
      });
    }

    // Ensure the pet is still available for adoption
    if (pet.adoptionStatus !== 'Available') {
      return res.json({ 
        success: false, 
        message: 'This pet is no longer available for adoption' 
      });
    }
    // Find the adopter
    const adopter = await Adopter.findById(adopterId);

    if (!adopter) {
      return res.json({
        success: false,
        message: 'Adopter not found or account no longer exists.'
      });
    }
    
    // Check if the adopter has already submitted a pending request for this pet
    const existingRequest = adopter.adoptionRequests.find(
      req => req.petId.toString() === petId && req.status === 'Pending'
    );

    if (existingRequest) {
      return res.json({ 
        success: false, 
        message: 'You have already submitted a request for this pet' 
      });
    }

    // Add a new adoption request
    adopter.adoptionRequests.push({
      petId,
      status: 'Pending',
      requestDate: new Date()
    });

    await adopter.save();

    res.json({ 
      success: true, 
      message: 'Adoption request submitted!' 
    });
  } catch (error) {
    console.error('Submit Request Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit request' 
    });
  }
});

// 6. Cancel Adoption Request
router.delete('/:adopterId/request/:petId', async (req, res) => {
  try {
    const { adopterId, petId } = req.params;

    const adopter = await Adopter.findById(adopterId);

    if (!adopter) {
      return res.json({
        success: false,
        message: 'Adopter not found or account no longer exists.'
      });
    }
    
    // Remove the specified adoption request
    adopter.adoptionRequests = adopter.adoptionRequests.filter(
      req => req.petId.toString() !== petId
    );

    await adopter.save();

    res.json({ 
      success: true, 
      message: 'Request cancelled' 
    });
  } catch (error) {
    console.error('Cancel Request Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel request' 
    });
  }
});

// 7. Get All Adoption Requests of an Adopter
router.get('/:adopterId/requests', async (req, res) => {
  try {
    const { adopterId } = req.params;

    const adopter = await Adopter.findById(adopterId)
      .populate('adoptionRequests.petId'); // Populate pet details

      if (!adopter) {
      return res.json({
        success: false,
        message: 'Adopter not found'
      });
    }

    res.json({ 
      success: true, 
      requests: adopter.adoptionRequests 
    });
  } catch (error) {
    console.error('Fetch Requests Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requests' 
    });
  }
});

// 8. Get Adopter Profile
router.get('/:id', async (req, res) => {
  try {
    const adopter = await Adopter.findById(req.params.id)
      .populate('adoptedPets.petId') // Populate adopted pet details
      .populate('adoptionRequests.petId'); // Populate requested pet details

    if (!adopter) {
      return res.json({ success: false, message: 'Adopter not found' });
    }

    res.json({ 
      success: true, 
      adopter: adopter,
      adoptedPets: adopter.adoptedPets,
      adoptionRequests: adopter.adoptionRequests
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// 9. Update Adopter Profile
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
        updatedAt: new Date()
      },
      { new: true } // Return the updated document
    );

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      adopter: updatedAdopter 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

module.exports = router;