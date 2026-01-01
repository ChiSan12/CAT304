require("dotenv").config();
const mongoose = require("mongoose");
const VetClinic = require("./models/VeterinaryClinic");

async function seed() {
  try {
    // 🔹 Connect to MongoDB Atlas (FORCE test DB)
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "test"
    });

    console.log("✅ MongoDB connected");
    console.log("📦 Connected DB:", mongoose.connection.name);

    // 🔹 Clear existing clinics
    const deleted = await VetClinic.deleteMany();
    console.log(`🗑️ Deleted ${deleted.deletedCount} existing clinics`);

    // 🔹 Insert clinics
    const clinics = await VetClinic.insertMany([
      {
        name: "Island Veterinary Clinic",
        address: "Jalan Perak, George Town, Penang",
        location: {
          type: "Point",
          coordinates: [100.3129, 5.4213] // [lng, lat]
        }
      },
      {
        name: "Gurney Veterinary Clinic",
        address: "Gurney Drive, Penang",
        location: {
          type: "Point",
          coordinates: [100.3067, 5.4378]
        }
      },
      {
        name: "Rainbow Veterinary Clinic",
        address: "Sungai Dua, Penang",
        location: {
          type: "Point",
          coordinates: [100.2946, 5.3535]
        }
      }
    ]);

    console.log(`🏥 Inserted ${clinics.length} veterinary clinics`);

    // 🔹 Ensure geospatial index exists
    await VetClinic.collection.createIndex({ location: "2dsphere" });
    console.log("📍 2dsphere index ensured");

    console.log("🎉 Veterinary clinics seeded successfully");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();