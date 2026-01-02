const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Adopter = require("../models/adopter");
const Pet = require("../models/pet");
const Shelter = require("../models/shelter");

//1. Register New User
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Check if user already exists (by email)
    const existingUser = await Adopter.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new adopter account
    const newAdopter = new Adopter({
      email,
      password: hashedPassword,
      fullName,
      phone,
    });

    await newAdopter.save();

    res.json({
      success: true,
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
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
        message: "User not found",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, adopter.password);

    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    // Prepare user data (exclude password)
    const adopterData = {
      id: adopter._id,
      email: adopter.email,
      fullName: adopter.fullName,
      phone: adopter.phone,
      preferences: adopter.preferences,
    };

    res.json({
      success: true,
      message: "Login successful",
      adopter: adopterData,
      adopterId: adopter._id,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// 3. Get All Available Pets (Browse Pets)
router.get("/pets/all", async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location phone email') // Populate shelter info
      .sort({ createdAt: -1 }); // Latest pets first

    res.json({
      success: true,
      pets,
    });
  } catch (error) {
    console.error("Fetch Pets Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pets",
    });
  }
});

//  4. Get Single Pet Details 
router.get('/pets/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    
    const pet = await Pet.findById(petId)
      .populate('shelterId', 'name location phone email');

    if (!pet) {
      return res.json({ 
        success: false, 
        message: 'Pet not found' 
      });
    }

    res.json({ 
      success: true, 
      pet 
    });
  } catch (error) {
    console.error('Fetch Pet Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pet details' 
    });
  }
});

// helper: convert pet age to age group
function getAgeGroup(pet) {
  const years = pet.age?.years || 0;
  const months = pet.age?.months || 0;
  const totalMonths = years * 12 + months;

  if (totalMonths < 12) return "Puppy";
  if (totalMonths < 36) return "Young";
  if (totalMonths < 96) return "Adult";
  return "Senior";
}

// 5. Smart Pet Matching
router.post('/pets/match', async (req, res) => {
  try {
    const { adopterId } = req.body;

    // Fetch adopter preferences
    const adopter = await Adopter.findById(adopterId);
    if (!adopter) {
      return res.json({ success: false, message: "Adopter not found" });
    }

    const prefs = adopter.preferences;

    const isProfileComplete =
      prefs.preferredSize?.length > 0 &&
      prefs.preferredTemperament?.length > 0 &&
      prefs.preferredAge?.length > 0 &&
      !!prefs.experienceLevel;

    if (!isProfileComplete) {
      return res.json({
        success: false,
        needsPreferences: true,
        message: "All adoption preferences must be completed before using Smart Matching",
      });
    }

    // Fetch all available pets 
    const allPets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location phone email');

    // Calculate compatibility score for each pet
    const petsWithScores = allPets.map((pet) => {
      let score = 0;
      let maxScore = 0;

      // 1. Size matching (30 points)
      // Only add to maxScore if user specified preferences
      if (prefs.preferredSize && prefs.preferredSize.length > 0) {
        maxScore += 30;
        if (prefs.preferredSize.includes(pet.size)) {
          score += 30;
        }
      }

      // 2. Temperament matching (40 points)
      //  Only add to maxScore if user specified preferences
      if (prefs.preferredTemperament && prefs.preferredTemperament.length > 0) {
        maxScore += 40;
        const matchingTemperaments = pet.labels.temperament.filter(t => 
          prefs.preferredTemperament.includes(t)
        );
        if (matchingTemperaments.length > 0) {
          score += (matchingTemperaments.length / prefs.preferredTemperament.length) * 40;
        }
      }

      // 3. Age matching (20 points)
      if (prefs.preferredAge && prefs.preferredAge.length > 0) {
        maxScore += 20;

        const petAgeGroup = getAgeGroup(pet);
        if (prefs.preferredAge.includes(petAgeGroup)) {
          score += 20;
        }
      }

      // 4. Living environment matching (30 points)
      maxScore += 30;

      // Suitable for children
      if (prefs.hasChildren && pet.labels.goodWith.includes("Children")) {
        score += 10;
      }

      // Suitable for other pets
      if (prefs.hasOtherPets && (
        pet.labels.goodWith.includes('Other Dogs') || 
        pet.labels.goodWith.includes('Other Cats')
      )) {
        score += 10;
      }

      // Large pets require garden space 
      if (pet.size === 'Large' && prefs.hasGarden) {
        score += 10;
      }

      // 5. Experience (10)
      if (prefs.experienceLevel) {
        maxScore += 10;
        if (prefs.experienceLevel === "Experienced") score += 10;
        else if (prefs.experienceLevel === "Some Experience") score += 7;
        else if (prefs.experienceLevel === "First-time") {
          if (!pet.specialNeeds && pet.size !== "Large") score += 10;
      }
    }

      // Experience penalty
      if (
        prefs.experienceLevel === "First-time" &&
        pet.size === "Large"
      ) {
        score -= 5;
      }

      // Calculate final compatibility score
      // Handle case where maxScore is 0 (no preferences)
      const compatibilityScore = maxScore > 0 
        ? Math.round((score / maxScore) * 100) 
        : 0;

      return {
        ...pet.toObject(),
        compatibilityScore,
      };
    });

    // Sort pets by compatibility score 
    petsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({ 
      success: true, 
      pets: petsWithScores,
    });
  } catch (error) {
    console.error("AI Matching Error:", error);
    res.status(500).json({
      success: false,
      message: "AI matching failed",
    });
  }
});

// 6. Submit Adoption Request
router.post('/:adopterId/request', async (req, res) => {
  try {
    const { adopterId } = req.params;
    const { petId } = req.body;

    // Re-fetch pet to check current status (real-time check)
    // This prevents race conditions where pet is adopted between page load and request
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.json({
        success: false,
        message: "Pet not found",
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
        message: "Adopter not found or account no longer exists.",
      });
    }
    
    // Check if the adopter has already submitted a pending request 
    const existingRequest = adopter.adoptionRequests.find(
      (req) => req.petId.toString() === petId && req.status === "Pending"
    );

    if (existingRequest) {
      return res.json({
        success: false,
        message: "You have already submitted a request for this pet",
      });
    }

    // Add a new adoption request 
    adopter.adoptionRequests.push({
      petId,
      status: "Pending",
      requestDate: new Date(),
    });

    await adopter.save();

    res.json({
      success: true,
      message: "Adoption request submitted!",
    });
  } catch (error) {
    console.error("Submit Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit request",
    });
  }
});

// 7. Cancel Adoption Request
router.delete('/:adopterId/request/:petId', async (req, res) => {
  try {
    const { adopterId, petId } = req.params;

    const adopter = await Adopter.findById(adopterId);

    if (!adopter) {
      return res.json({
        success: false,
        message: "Adopter not found or account no longer exists.",
      });
    }

    // Remove the specified adoption request
    adopter.adoptionRequests = adopter.adoptionRequests.filter(
      (req) => req.petId.toString() !== petId
    );

    await adopter.save();

    res.json({
      success: true,
      message: "Request cancelled",
    });
  } catch (error) {
    console.error("Cancel Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel request",
    });
  }
});

// 8. Get All Adoption Requests of an Adopter
router.get('/:adopterId/requests', async (req, res) => {
  try {
    const { adopterId } = req.params;

    const adopter = await Adopter.findById(adopterId)
      .populate('adoptionRequests.petId');

    if (!adopter) {
      return res.json({
        success: false,
        message: "Adopter not found",
      });
    }

    res.json({
      success: true,
      requests: adopter.adoptionRequests,
    });
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
    });
  }
});

// 9. Get Adopter Profile
router.get('/:id', async (req, res) => {
  try {
    const adopter = await Adopter.findById(req.params.id)
      .populate('adoptedPets.petId')
      .populate('adoptionRequests.petId');

    if (!adopter) {
      return res.json({ success: false, message: "Adopter not found" });
    }

    res.json({
      success: true,
      adopter: adopter,
      adoptedPets: adopter.adoptedPets,
      adoptionRequests: adopter.adoptionRequests,
    });
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

// 10. Update Adopter Profile
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
        updatedAt: new Date(),
      },
      { new: true } // Return the updated document
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      adopter: updatedAdopter,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

module.exports = router;
