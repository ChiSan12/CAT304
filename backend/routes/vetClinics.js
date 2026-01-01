const express = require('express');
const router = express.Router();
const VetClinic = require('../models/vetClinic');

/**
 * GET /api/vet-clinics/nearby
 * ?lat=5.4141&lng=100.3294
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const clinics = await VetClinic.find();

    const withDistance = clinics.map(c => {
      const dx = c.location.lat - Number(lat);
      const dy = c.location.lng - Number(lng);
      const distance = Math.sqrt(dx * dx + dy * dy) * 111; // km approx

      return {
        ...c.toObject(),
        distance: Number(distance.toFixed(2)),
      };
    });

    res.json(withDistance.sort((a, b) => a.distance - b.distance));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch clinics' });
  }
});

module.exports = router;