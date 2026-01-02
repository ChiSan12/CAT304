const express = require('express');
const router = express.Router();
const multer = require('multer');
const PetUpdate = require('../models/petUpdate');

// ============================
// Multer (inline, memory)
// ============================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per image
  }
});

// ============================
// ADOPTER: submit pet update
// ============================
router.post(
  '/',
  upload.array('images', 5),
  async (req, res) => {

    try {
      const {
        petId,
        adopterId,
        shelterId,
        notes,
        weight,
        condition
      } = req.body;

      console.log('🐾 PET UPDATE RECEIVED:', {
        petId,
        adopterId,
        shelterId,
        notes,
        files: req.files?.length
      });

      if (!petId || !adopterId || !shelterId || !notes) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const images = req.files?.map(f => ({
        data: f.buffer,
        contentType: f.mimetype
      })) || [];

      const update = await PetUpdate.create({
        petId,
        adopterId,
        shelterId,
        notes,
        weight,
        condition,
        images
      });

      res.json({
        success: true,
        message: 'Pet update submitted',
        update
      });

    } catch (err) {
      console.error('Pet Update Error:', err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

// =================================
// SHELTER: view updates by pet
// =================================
router.get('/pet/:petId', async (req, res) => {
  try {
    const updates = await PetUpdate.find({
      petId: req.params.petId
    }).sort({ createdAt: -1 });

    // Convert image buffer to Base64
    const formatted = updates.map(u => {
      const obj = u.toObject();
      obj.images = obj.images.map(img => ({
        image: `data:${img.contentType};base64,${img.data.toString('base64')}`
      }));
      return obj;
    });

    res.json({
      success: true,
      updates: formatted
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;