import mongoose from "mongoose";
import VeterinaryClinic from "../models/VeterinaryClinic.js";

await mongoose.connect("mongodb://127.0.0.1:27017/petfoundus");

const clinics = [
  {
    name: "Gurney Veterinary Clinic",
    address: "Gurney Drive, George Town, Penang",
    phone: "04-226 5885",
    location: {
      type: "Point",
      coordinates: [100.3067, 5.4378]
    }
  },
  {
    name: "Island Veterinary Clinic",
    address: "Jalan Perak, Penang",
    phone: "04-228 2944",
    location: {
      type: "Point",
      coordinates: [100.3129, 5.4213]
    }
  },
  {
    name: "Rainbow Veterinary Clinic",
    address: "Sungai Dua, Penang",
    phone: "04-655 2208",
    location: {
      type: "Point",
      coordinates: [100.2946, 5.3535]
    }
  }
];

await VeterinaryClinic.insertMany(clinics);
console.log("🐾 Vet clinics seeded");
process.exit();