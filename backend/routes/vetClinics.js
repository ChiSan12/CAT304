const express = require("express");
const VeterinaryClinic = require("../models/VeterinaryClinic");

const router = express.Router();

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const clinics = await VeterinaryClinic.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: "distance",   // ← THIS is what you’re missing
          spherical: true,
          maxDistance: 8000            // 8 km
        }
      },
      {
        $limit: 10
      }
    ]);

    res.json(clinics);
  } catch (err) {
    console.error("Nearby vet error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;