const express = require('express');
const router = express.Router();
const CareReminder = require('../models/careReminder');

/**
 * GET reminders for a pet (adopter view)
 */
router.get('/pet/:petId', async (req, res) => {
  try {
    const reminders = await CareReminder.find({
      petId: req.params.petId,
      status: { $ne: 'disabled' },
    }).sort({ dueDate: 1 });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
});

/**
 * PUT mark reminder as completed (adopter)
 */
router.put('/:id/complete', async (req, res) => {
  try {
    const reminder = await CareReminder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        completedAt: new Date(),
      },
      { new: true }
    );

    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reminder' });
  }
});

/**
 * PUT edit / disable reminder (shelter override)
 */
router.put('/:id', async (req, res) => {
  try {
    const { dueDate, notes, status } = req.body;

    const reminder = await CareReminder.findByIdAndUpdate(
      req.params.id,
      { dueDate, notes, status },
      { new: true }
    );

    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reminder' });
  }
});

const generateVaccinationReminder = async (pet) => {
  const health = pet.healthStatus || {};

  let dueDate;
  let title;

  if (health.nextVaccinationDue) {
    dueDate = new Date(health.nextVaccinationDue);
    title = 'Vaccination Reminder';
  } else if (health.vaccinated === false) {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    title = 'Initial Vaccination Required';
  } else {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    title = 'Vaccination Check';
  }

  return CareReminder.create({
    petId: pet._id,
    type: 'vaccination',
    title,
    dueDate,
    status: 'pending',
    createdBy: 'system',
    notes: 'Automatically generated after adoption',
  });
};

module.exports = router;