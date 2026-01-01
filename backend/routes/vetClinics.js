const express = require("express");
const VeterinaryClinic = require("../models/VeterinaryClinic");

const router = express.Router();

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const clinics = await VeterinaryClinic.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 8000
        }
      }
    });

    res.json(clinics);
  } catch (err) {
    console.error("Nearby vet error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;