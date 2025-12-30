const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const Pet = require('../models/pet');
const Shelter = require('../models/shelter');
const Adopter = require('../models/adopter');

// 0. Shelter Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find shelter by email
    const shelter = await Shelter.findOne({ email });
    if (!shelter) {
      return res.json({ success: false, message: 'Shelter not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, shelter.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Prepare shelter data
    const shelterData = {
      id: shelter._id,
      name: shelter.name,
      email: shelter.email,
      role: 'shelter' // Identifies this user as an Admin
    };

    res.json({ 
      success: true, 
      message: 'Shelter login successful',
      shelter: shelterData
    });
  } catch (error) {
    console.error('Shelter Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 1. Get Shelter Dashboard Stats
router.get('/:shelterId/stats', async (req, res) => {
  try {
    const { shelterId } = req.params;
    
    const totalPets = await Pet.countDocuments({ shelterId });
    const availablePets = await Pet.countDocuments({ shelterId, adoptionStatus: 'Available' });
    const adoptedPets = await Pet.countDocuments({ shelterId, adoptionStatus: 'Adopted' });

    // Count pending requests
    const myPets = await Pet.find({ shelterId }).select('_id');
    const myPetIds = myPets.map(p => p._id);

    const pendingRequests = await Adopter.countDocuments({
      'adoptionRequests': {
        $elemMatch: {
          petId: { $in: myPetIds },
          status: 'Pending'
        }
      }
    });

    res.json({ success: true, stats: { totalPets, availablePets, adoptedPets, pendingRequests } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Add New Pet
router.post('/:shelterId/pets', async (req, res) => {
  try {
    const { shelterId } = req.params;
    const newPet = new Pet({
      ...req.body,
      shelterId,
      adoptionStatus: 'Available'
    });
    await newPet.save();
    
    await Shelter.findByIdAndUpdate(shelterId, { $push: { pets: newPet._id } });

    res.json({ success: true, message: 'Pet added successfully!', pet: newPet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Update Pet
router.put('/pets/:petId', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.petId,
      req.body,
      { new: true }
    );
    res.json({ success: true, message: 'Pet updated', pet: updatedPet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Delete Pet
router.delete('/pets/:petId', async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.petId);
    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get All Pets for this Shelter
router.get('/:shelterId/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ shelterId: req.params.shelterId });
    res.json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Get Incoming Adoption Requests
router.get('/:shelterId/requests', async (req, res) => {
  try {
    const myPets = await Pet.find({ shelterId: req.params.shelterId }).select('_id name images');
    const myPetIds = myPets.map(p => p._id.toString());

    const adopters = await Adopter.find({
      'adoptionRequests.petId': { $in: myPetIds }
    }).select('fullName email phone adoptionRequests');

    let requests = [];
    adopters.forEach(adopter => {
      adopter.adoptionRequests.forEach(req => {
        if (myPetIds.includes(req.petId.toString())) {
          const pet = myPets.find(p => p._id.toString() === req.petId.toString());
          requests.push({
            requestId: req._id,
            adopterName: adopter.fullName,
            adopterEmail: adopter.email,
            adopterPhone: adopter.phone,
            petName: pet.name,
            petImage: pet.images[0]?.url,
            status: req.status,
            date: req.requestDate,
            petId: pet._id,
            adopterId: adopter._id
          });
        }
      });
    });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Process Adoption Request (Approve/Reject)
router.put('/requests/:adopterId/:requestId', async (req, res) => {
  try {
    const { status } = req.body;
    const { adopterId, requestId } = req.params;

    await Adopter.findOneAndUpdate(
      { _id: adopterId, "adoptionRequests._id": requestId },
      { 
        $set: { "adoptionRequests.$.status": status }
      }
    );

    res.json({ success: true, message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Get Shelter Profile Details
router.get('/:shelterId', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.shelterId).select('-password');
    if (!shelter) return res.status(404).json({ success: false, message: 'Shelter not found' });
    res.json({ success: true, shelter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Update Shelter Profile
router.put('/:shelterId', async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    
    const updatedShelter = await Shelter.findByIdAndUpdate(
      req.params.shelterId,
      { 
        name, 
        phone,
        location // Expecting object: { address, city, state }
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated!', shelter: updatedShelter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;