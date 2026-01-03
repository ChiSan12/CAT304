const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Report = require('../models/report');
const Adopter = require('../models/adopter');
const Pet = require('../models/pet'); // Needed for rescue logic

const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- 1. CREATE REPORT (Public) ---
router.post('/', upload.single('photoUrl'), async (req, res) => {
  try {
    const { animalType, number, condition, animalDesc, placeDesc, pinLat, pinLng, email } = req.body;

    // Check all required fields
    if (!animalType || !number || !condition || !animalDesc || !placeDesc || !pinLat || !pinLng || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // **Check photo is uploaded**
    if (!req.file) {
      return res.status(400).json({ message: "Photo is required" });
    }

    const adopter = await Adopter.findOne({ email });
    if (!adopter) return res.status(404).json({ message: "Adopter account not found. Please register/login." });

    const report = new Report({
      animalType,
      number: Number(number),
      condition,
      animalDesc,
      placeDesc,
      pin: { lat: Number(pinLat), lng: Number(pinLng) },
      photoUrl: req.file.buffer, // mandatory now
      reportedBy: adopter._id,
      status: 'Pending'
    });

    await report.save();
    res.json({ message: "Report submitted successfully!", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit report" });
  }
});


// GET REPORTS (Admin or User)
router.get('/', async (req, res) => {
  try {
    const { userId, email } = req.query;
    let filter = {};

    if (userId) {
      filter.reportedBy = userId; // old way
    } else if (email) {
      // Find adopter by email
      const adopter = await Adopter.findOne({ email });
      if (adopter) filter.reportedBy = adopter._id;
      else return res.json({ reports: [] }); // no adopter found
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'fullName email');

    const formattedReports = reports.map(r => {
      const doc = r.toObject();
      if (r.photoUrl) {
        doc.image = `data:image/jpeg;base64,${r.photoUrl.toString('base64')}`;
        delete doc.photoUrl;
      }
      return doc;
    });

    res.json({success: true, reports: formattedReports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});



// --- 3. UPDATE STATUS (Admin) ---
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await Report.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// --- 4. DELETE REPORT (Admin) ---
router.delete('/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// --- 5. RESCUE & CONVERT TO PET (Admin) ---
router.post('/:id/rescue', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { name, breed, ageYears, ageMonths, gender, shelterId } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // 1. Create the Pet
    const newPet = new Pet({
      name: name || "Rescued Stray",
      species: report.animalType === 'Dog' || report.animalType === 'Cat' ? report.animalType : 'Dog',
      breed: breed || "Mixed",
      gender: gender || 'Male',
      age: { 
        years: Number(ageYears) || 0, 
        months: Number(ageMonths) || 0 
      },
      size: 'Medium',
      shelterId: shelterId,
      description: `Rescued from ${report.placeDesc}. Condition: ${report.condition}. \n${report.animalDesc}`,
      status: 'Available',
      images: report.photoUrl ? [{ 
        url: `data:image/jpeg;base64,${report.photoUrl.toString('base64')}` 
      }] : []
    });

    await newPet.save();

    // 2. Update Report Status (Using findByIdAndUpdate to avoid validation errors on legacy data)
    await Report.findByIdAndUpdate(reportId, { status: 'Rescued' });

    res.json({ success: true, message: "Pet created successfully!" });

  } catch (err) {
    console.error("Rescue Error:", err);
    res.status(500).json({ message: "Failed to rescue pet: " + err.message });
  }
});

module.exports = router;