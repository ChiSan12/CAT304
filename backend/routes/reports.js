const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/report');

// Optional file upload in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/reports
router.post('/', upload.single('photoUrl'), async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { animalType, number, condition, animalDesc, placeDesc, pinLat, pinLng } = req.body;

    if (!animalType || !number || !condition || !animalDesc || !placeDesc || !pinLat || !pinLng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const report = new Report({
      animalType,
      number: Number(number),
      condition,
      animalDesc,
      placeDesc,
      pin: {
        lat: Number(pinLat),
        lng: Number(pinLng),
      },
      photoUrl: req.file ? req.file.buffer : undefined, // optional
    });

    await report.save();

    // Send created report including timestamp
    res.json({ message: "Report submitted successfully!", report });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

module.exports = router;
