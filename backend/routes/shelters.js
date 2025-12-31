const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose'); 
const Pet = require('../models/pet');
const Shelter = require('../models/shelter');
const Adopter = require('../models/adopter');

// 0. SHELTER LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const shelter = await Shelter.findOne({ email });
    if (!shelter) return res.json({ success: false, message: 'Shelter not found' });
    const isMatch = await bcrypt.compare(password, shelter.password);
    if (!isMatch) return res.json({ success: false, message: 'Invalid credentials' });
    res.json({ success: true, message: 'Login successful', shelter: { id: shelter._id, name: shelter.name, role: 'shelter' } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 1. DASHBOARD STATS
router.get('/:shelterId/stats', async (req, res) => {
  try {
    const { shelterId } = req.params;
    
    const totalPets = await Pet.countDocuments({ shelterId });
    const availablePets = await Pet.countDocuments({ shelterId, adoptionStatus: 'Available' });
    const adoptedPets = await Pet.countDocuments({ shelterId, adoptionStatus: 'Adopted' });

    // Pending Requests Logic
    const myPets = await Pet.find({ shelterId }).select('_id');
    const myPetIds = myPets.map(p => p._id.toString());
    const adopters = await Adopter.find({ 'adoptionRequests.petId': { $in: myPets.map(p => p._id) } });

    let pendingRequestsCount = 0;
    adopters.forEach(adopter => {
      if(adopter.adoptionRequests) {
        adopter.adoptionRequests.forEach(req => {
          if (myPetIds.includes(req.petId.toString()) && req.status === 'Pending') {
            pendingRequestsCount++;
          }
        });
      }
    });

    res.json({ success: true, stats: { totalPets, availablePets, adoptedPets, pendingRequests: pendingRequestsCount } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 2. ADD PET
router.post('/:shelterId/pets', async (req, res) => {
  try {
    const { shelterId } = req.params;
    let { images, ...petData } = req.body;
    if (!images || images.length === 0) images = [{ url: 'https://via.placeholder.com/300' }];
    const newPet = new Pet({ ...petData, images, shelterId, adoptionStatus: 'Available' });
    await newPet.save();
    await Shelter.findByIdAndUpdate(shelterId, { $push: { pets: newPet._id } });
    res.json({ success: true, message: 'Pet added', pet: newPet });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 3. UPDATE PET
router.put('/pets/:petId', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.petId, req.body, { new: true });
    res.json({ success: true, message: 'Pet updated', pet: updatedPet });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 4. DELETE PET
router.delete('/pets/:petId', async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.petId);
    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 5. GET ALL PETS
router.get('/:shelterId/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ shelterId: req.params.shelterId });
    res.json({ success: true, pets });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 6. GET REQUESTS
router.get('/:shelterId/requests', async (req, res) => {
  try {
    const myPets = await Pet.find({ shelterId: req.params.shelterId }).select('_id name images');
    const myPetIds = myPets.map(p => p._id.toString());
    
    const adopters = await Adopter.find({
      'adoptionRequests.petId': { $in: myPets.map(p => p._id) }
    }).select('fullName email phone adoptionRequests');

    let requests = [];
    adopters.forEach(adopter => {
      adopter.adoptionRequests.forEach(req => {
        if (myPetIds.includes(req.petId.toString())) {
          const pet = myPets.find(p => p._id.toString() === req.petId.toString());
          if (pet) {
            requests.push({
              requestId: req._id,
              adopterId: adopter._id,
              adopterName: adopter.fullName,
              adopterEmail: adopter.email,
              adopterPhone: adopter.phone,
              petName: pet.name,
              petImage: pet.images?.[0]?.url,
              status: req.status,
              date: req.requestDate,
              petId: pet._id.toString()
            });
          }
        }
      });
    });
    res.json({ success: true, requests });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ==================================================================
// 7. PROCESS REQUEST (UPDATED LOGIC: MANUAL LOOP)
// ==================================================================
router.put('/requests/:adopterId/:requestId', async (req, res) => {
  try {
    const { status, petId } = req.body; 
    const { adopterId, requestId } = req.params;

    // STEP A: Update the User's Request
    // We fetch the user first to ensure we are modifying the correct sub-document
    const mainAdopter = await Adopter.findById(adopterId);
    if(mainAdopter) {
        const targetReq = mainAdopter.adoptionRequests.id(requestId);
        if(targetReq) {
            targetReq.status = status;
            await mainAdopter.save();
        }
    }

    // STEP B: If Approved, Run Auto-Logic
    if (status === 'Approved' && petId) {
      
      // 1. UPDATE PET STATUS TO ADOPTED
      await Pet.findByIdAndUpdate(petId, { adoptionStatus: 'Adopted' });

      // 2. REJECT OTHERS (MANUAL LOOP METHOD)
      // We search for ALL users who have a request for this specific petId
      const allAdopters = await Adopter.find({ "adoptionRequests.petId": petId });

      for (const user of allAdopters) {
        let modified = false;

        user.adoptionRequests.forEach(req => {
          // Logic: Same Pet ID + Status is Pending + NOT the request we just approved
          if (req.petId.toString() === petId.toString() && 
              req.status === 'Pending' && 
              req._id.toString() !== requestId.toString()) {
            
            req.status = 'Rejected';
            modified = true;
          }
        });

        if (modified) {
          await user.save(); // Save changes to this user
        }
      }
    }

    res.json({ success: true, message: `Request updated to ${status}` });

  } catch (error) { 
    console.error(error);
    res.status(500).json({ success: false, message: error.message }); 
  }
});

// 8. GET PROFILE
router.get('/:shelterId', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.shelterId).select('-password');
    res.json({ success: true, shelter });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// 9. UPDATE PROFILE
router.put('/:shelterId', async (req, res) => {
  try {
    const updatedShelter = await Shelter.findByIdAndUpdate(req.params.shelterId, req.body, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile updated!', shelter: updatedShelter });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;