const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/report');
const Adopter = require('../models/adopter');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('photoUrl'), async (req, res) => {
  try {
    const { animalType, number, condition, animalDesc, placeDesc, pinLat, pinLng, email } = req.body;

    if (!animalType || !number || !condition || !animalDesc || !placeDesc || !pinLat || !pinLng || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the adopter by email (or any unique identifier)
    const adopter = await Adopter.findOne({ email });
    if (!adopter) return res.status(404).json({ message: "Adopter not found" });

    const report = new Report({
      animalType,
      number: Number(number),
      condition,
      animalDesc,
      placeDesc,
      pin: { lat: Number(pinLat), lng: Number(pinLng) },
      photoUrl: req.file ? req.file.buffer : undefined,
      reportedBy: adopter._id, // fill automatically
    });

    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'fullName email');

    res.json({ message: "Report submitted successfully!", report: populatedReport });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

module.exports = router;
