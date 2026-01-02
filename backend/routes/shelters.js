const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose'); 
const Pet = require('../models/pet');
const Shelter = require('../models/shelter');
const Adopter = require('../models/adopter');
const ReminderTemplate = require('../models/reminderTemplate');
const CareReminder = require('../models/careReminder');

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

// POST-ADOPTION (ADMIN)
router.get('/adopted-pets', async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: 'Adopted' })
      .populate('shelterId', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, pets });
  } catch (err) {
    console.error('Fetch adopted pets error:', err);
    res.status(500).json({ success: false });
  }
});

// GET public shelter contact (Footer)
router.get('/public/contact', async (req, res) => {
  try {
    const shelter = await Shelter.findOne({ isAdmin: true }).select(
      'email phone address name'
    );

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found'
      });
    }

    res.json({
      success: true,
      contact: {
        email: shelter.email,
        phone: shelter.phone,
        address: shelter.address,
        name: shelter.name
      }
    });

  } catch (err) {
    console.error('Fetch shelter contact error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load shelter contact'
    });
  }
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

// 7. Get All Adoption Requests of an Adopter
router.get('/:adopterId/requests', async (req, res) => {
  try {
    const { adopterId } = req.params;

    // 1. Fetch the adopter
    const adopter = await Adopter.findById(adopterId)
      .populate('adoptionRequests.petId'); 

    // 2. CRITICAL FIX: Check if adopter exists before accessing properties
    if (!adopter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Adopter not found',
        requests: [] // Return empty array so frontend doesn't crash
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

// 10. APPROVE ADOPTION REQUEST
router.patch('/:shelterId/requests/:requestId/approve', async (req, res) => {
  try {
    const { shelterId, requestId } = req.params;

    // Find the adopter who owns this adoption request
    const adopter = await Adopter.findOne({
      'adoptionRequests._id': requestId
    });

    if (!adopter) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    const request = adopter.adoptionRequests.id(requestId);

    if (!request || request.status !== 'Pending') {
      return res.json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Confirm that pet belong to this shelter
    const pet = await Pet.findById(request.petId);
    if (!pet || pet.shelterId.toString() !== shelterId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized action'
      });
    }

    // 1. Approve request
    request.status = 'Approved';

    // 2. Pet set as ddopted
    pet.adoptionStatus = 'Adopted';

    /* ================= 🔥 AUTOMATED CARE REMINDERS 🔥 ================= */

    // Fetch reminder templates for this shelter
    const templates = await ReminderTemplate.find({
      shelterId: shelterId,
      active: true
    });

    // Create reminders from templates
    const reminders = templates.map(t => ({
      petId: pet._id,
      adopterId: adopter._id,
      shelterId: shelterId,
      title: t.title,
      description: t.description,
      category: t.title.toLowerCase().includes("vaccin")
        ? "Vaccination"
        : "Health Check",
      dueDate: new Date(
        Date.now() + t.daysAfterAdoption * 24 * 60 * 60 * 1000
      ),
      status: 'Pending',                 
      createdBy: 'System'                 
    }));

    await CareReminder.deleteMany({
      petId: pet._id,
      adopterId: adopter._id
    });

    // Insert all reminders at once
    if (reminders.length > 0) {
      await CareReminder.insertMany(reminders);
    }

    // 3. Reject same pet pending request
    await Adopter.updateMany(
      { 'adoptionRequests.petId': pet._id },
      {
        $set: {
          'adoptionRequests.$[elem].status': 'Rejected'
        }
      },
      {
        arrayFilters: [
          { 'elem.petId': pet._id, 'elem.status': 'Pending' }
        ]
      }
    );

    await adopter.save();
    await pet.save();

    res.json({
      success: true,
      message: 'Adoption request approved'
    });

  } catch (error) {
  console.error('🔥 APPROVE ERROR FULL:', error);
  console.error('🔥 ERROR MESSAGE:', error.message);
  console.error('🔥 ERROR STACK:', error.stack);

  res.status(500).json({
    success: false,
    message: error.message   // 👈 SHOW REAL ERROR
  });
}
});

// 11. REJECT ADOPTION REQUEST
router.patch('/:shelterId/requests/:requestId/reject', async (req, res) => {
  try {
    const { shelterId, requestId } = req.params;

    const adopter = await Adopter.findOne({
      'adoptionRequests._id': requestId
    });

    if (!adopter) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    const request = adopter.adoptionRequests.id(requestId);

    if (!request || request.status !== 'Pending') {
      return res.json({
        success: false,
        message: 'Request is not pending'
      });
    }

    const pet = await Pet.findById(request.petId);
    if (!pet || pet.shelterId.toString() !== shelterId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized action'
      });
    }

    request.status = 'Rejected';
    await adopter.save();

    res.json({
      success: true,
      message: 'Adoption request rejected'
    });

  } catch (error) {
    console.error('Reject Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request'
    });
  }
});

module.exports = router;