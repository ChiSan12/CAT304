require("dotenv").config();
const mongoose = require("mongoose");
const VetClinic = require("./models/VeterinaryClinic");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "test"
    });

    console.log("MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);

    const clinics = [
      {
        name: "Island Veterinary Clinic",
        address: "Jalan Perak, George Town, Penang",
        location: {
          type: "Point",
          coordinates: [100.3129, 5.4213]
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
      },
      {
        name: "Paws & Claws Veterinary Clinic",
        address: "Tanjung Bungah, Penang",
        location: {
          type: "Point",
          coordinates: [100.2923, 5.4685]
        }
      },
      {
        name: "Animal Medical Centre",
        address: "Jelutong, Penang",
        location: {
          type: "Point",
          coordinates: [100.3216, 5.3965]
        }
      },
      {
        name: "Hope Veterinary Clinic",
        address: "Air Itam, Penang",
        location: {
          type: "Point",
          coordinates: [100.2886, 5.4121]
        }
      },
      {
        name: "Relau Veterinary Clinic",
        address: "Relau, Bayan Lepas, Penang",
        location: {
          type: "Point",
          coordinates: [100.2802, 5.3274]
        }
      },
      {
        name: "Bayan Baru Veterinary Clinic",
        address: "Bayan Baru, Penang",
        location: {
          type: "Point",
          coordinates: [100.2629, 5.3348]
        }
      },
      {
        name: "Happy Tails Veterinary Clinic",
        address: "Bukit Mertajam, Penang",
        location: {
          type: "Point",
          coordinates: [100.4663, 5.3676]
        }
      },
      {
        name: "Central Veterinary Clinic",
        address: "Butterworth, Penang",
        location: {
          type: "Point",
          coordinates: [100.3690, 5.3988]
        }
      }
    ];

    const inserted = await VetClinic.insertMany(clinics);
    console.log(`Inserted ${inserted.length} veterinary clinics`);

    await VetClinic.collection.createIndex({ location: "2dsphere" });
    console.log("2dsphere index ensured");

    console.log("Veterinary clinics seeded successfully");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();