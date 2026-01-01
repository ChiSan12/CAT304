require("dotenv").config();
const mongoose = require("mongoose");

const Shelter = require("./models/shelter");
const ReminderTemplate = require("./models/reminderTemplate");

async function seedReminderTemplates() {
  try {
    // 🔹 Connect to MongoDB (force test DB)
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "test"
    });

    console.log("✅ MongoDB connected");
    console.log("📦 Connected DB:", mongoose.connection.name);

    // 🔹 Find shelter (ADMIN)
    const shelter = await Shelter.findOne({
      email: "admin@petfoundus.com"
    });

    if (!shelter) {
      console.error("❌ Shelter not found. Seed shelter first.");
      process.exit(1);
    }

    console.log("🏠 Using Shelter:", shelter.name);

    // 🔹 Remove existing templates for clean reseed
    const deleted = await ReminderTemplate.deleteMany({
      shelterId: shelter._id
    });
    console.log(`🗑️ Deleted ${deleted.deletedCount} existing reminder templates`);

    // 🔹 Reminder Templates
    const templates = [
    {
        shelterId: shelter._id,
        title: "Initial Vaccination",
        category: "Vaccination",
        daysAfterAdoption: 7,
        description: "Schedule the pet’s first vaccination visit."
    },
    {
        shelterId: shelter._id,
        title: "Follow-up Vaccination",
        category: "Vaccination",
        daysAfterAdoption: 30,
        description: "Ensure follow-up vaccination is completed."
    },
    {
        shelterId: shelter._id,
        title: "General Health Check",
        category: "Health Check",
        daysAfterAdoption: 14,
        description: "Routine health check after adoption."
    },
    {
        shelterId: shelter._id,
        title: "Post-Adoption Health Review",
        category: "Health Check",
        daysAfterAdoption: 60,
        description: "Monitor pet’s overall health condition."
    }
    ];

    // 🔹 Insert templates
    const inserted = await ReminderTemplate.insertMany(templates);

    console.log(`✅ Inserted ${inserted.length} reminder templates`);
    console.log("🎉 Reminder template seeding completed successfully");

    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedReminderTemplates();