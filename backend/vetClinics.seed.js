const mongoose = require("mongoose");
const VetClinic = require("./models/VeterinaryClinic");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");

  await VetClinic.deleteMany();

  await VetClinic.insertMany([
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
    }
  ]);

  console.log("✅ Veterinary clinics seeded successfully");
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
