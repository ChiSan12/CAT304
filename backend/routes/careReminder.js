const express = require('express');
const router = express.Router();
const CareReminder = require('../models/careReminder');

// console.log('✅ careReminder routes loaded');

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
    const { dueDate, status, isActive } = req.body;

    const reminder = await CareReminder.findByIdAndUpdate(
      req.params.id,
      {
        ...(dueDate && { dueDate }),
        ...(status && { status }),       // Must be Pending / Completed / Overdue
        ...(typeof isActive === 'boolean' && { isActive })
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
      message: 'Failed to update reminder'
    });
  }
});

module.exports = router;