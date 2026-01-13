const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const CareReminder = require('../models/careReminder');

/**
 * ================================
 * GET reminders for a pet (Adopter)
 * ================================
 */
router.get('/pet/:petId', async (req, res) => {
  try {
    const reminders = await CareReminder.find({
      petId: req.params.petId,
      isActive: true
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      reminders
    });
  } catch (err) {
    console.error('Fetch reminders error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminders'
    });
  }
});

// ================================
// GET reminder preview (HOMEPAGE)
// ================================
router.get('/preview/:adopterId', async (req, res) => {
  try {
    const reminders = await CareReminder.find({
      adopterId: req.params.adopterId,      
      isActive: true,
      status: { $ne: 'Completed' },
    })
    .populate('petId', 'name')
    .sort({ dueDate: 1 })
    .lean();

    const cleanReminders = reminders.filter(r => r.petId);

    res.json({
      success: true,
      reminders: cleanReminders.slice(0, 10)
    });

  } catch (err) {
    console.error('Preview reminders error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load reminder preview'
    });
  }
});

router.post('/manual', async (req, res) => {
  try {
    console.log('📥 MANUAL REMINDER BODY:', req.body);

    const {
      petId,
      shelterId,
      title,
      dueDate,
      category,
      notes
    } = req.body;

    // ✅ minimal validation
    if (!petId || !shelterId || !title || !dueDate || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const reminder = await CareReminder.create({
      petId,
      shelterId,
      title,
      dueDate,
      category,
      description: notes,
      status: 'Pending',
      createdBy: 'Shelter'
    });

    res.json({
      success: true,
      reminder
    });

  } catch (err) {
    console.error('❌ MANUAL REMINDER ERROR:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * ==================================
 * MARK reminder as completed (Adopter)
 * ==================================
 */
router.put('/:id/complete', async (req, res) => {
  try {
    const reminder = await CareReminder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',     // ✅ ENUM SAFE
        completedAt: new Date()
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      reminder
    });
  } catch (err) {
    console.error('Complete reminder error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder'
    });
  }
});

/**
 * ==================================
 * EDIT reminder (Shelter override)
 * ==================================
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      status,
      isActive
    } = req.body;

    const reminder = await CareReminder.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate }),
        ...(status && { status }),
        ...(typeof isActive === 'boolean' && { isActive }),

        // 🔥 IMPORTANT
        updatedBy: 'Shelter'
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      reminder
    });

  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
/**
 * ==================================
 * SHELTER: delete (deactivate) reminder
 * ==================================
 */
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await CareReminder.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });

  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;