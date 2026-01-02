require('dotenv').config();
const mongoose = require('mongoose');

const Adopter = require('../models/adopter');
const CareReminder = require('../models/careReminder');
const ReminderTemplate = require('../models/reminderTemplate');

async function run() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    console.log('📦 Connected DB:', mongoose.connection.name);

    const adoptedPets = await Pet.find({
    adoptionStatus: 'Adopted'
    });

    let created = 0;
    let skippedExisting = 0;
    let skippedNoTemplates = 0;

    console.log(`🐾 Found adopted pets: ${adopters.reduce(
      (sum, a) => sum + a.adoptedPets.length, 0
    )}`);

    for (const adopter of adopters) {
      for (const adopted of adopter.adoptedPets) {

        // Skip if reminders already exist
        const exists = await CareReminder.findOne({
          petId: adopted.petId
        });

        if (exists) {
          skippedExisting++;
          continue;
        }

        // Get templates for this shelter
        const templates = await ReminderTemplate.find({
          shelterId: adopted.shelterId,
          active: true
        });

        if (templates.length === 0) {
          skippedNoTemplates++;
          continue;
        }

        const adoptionBaseDate = adopted.adoptionDate
          ? new Date(adopted.adoptionDate)
          : new Date(); // fallback for very old data

        const reminders = templates.map(t => ({
          petId: adopted.petId,
          adopterId: adopter._id,
          shelterId: t.shelterId,

          // 🔥 IMPORTANT: USE TEMPLATE CATEGORY DIRECTLY
          title: t.title,
          description: t.description,
          category: t.category, // ✅ SAFE ENUM VALUE

          dueDate: new Date(
            adoptionBaseDate.getTime() +
            t.daysAfterAdoption * 24 * 60 * 60 * 1000
          ),

          status: 'Pending',
          createdBy: 'System'
        }));

        await CareReminder.insertMany(reminders);
        created += reminders.length;
      }
    }

    console.log('🎉 Backfill completed successfully');
    console.log(`✔ Reminders created: ${created}`);
    console.log(`↩ Skipped pets (already had reminders): ${skippedExisting}`);
    console.log(`⚠ Pets with no templates: ${skippedNoTemplates}`);

    process.exit(0);

  } catch (err) {
    console.error('❌ Backfill failed:', err.message);
    process.exit(1);
  }
}

run();