require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('./models/pet'); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected... Starting Seed'))
  .catch(err => console.log(err));

const pets = [
  {
    name: "Lucky",
    species: "Dog",
    breed: "Golden Retriever",
    gender: "Male",
    age: { years: 2, months: 0 },
    size: "Large",
    labels: { temperament: ["Friendly", "Smart"], goodWith: ["Children"] },
    adoptionStatus: "Available",
    description: "A very happy golden retriever looking for a home."
    images: [{ url: "https://i.imgur.com/your-real-dog-photo.jpg" }],
  },
  {
    name: "Mimi",
    species: "Cat",
    breed: "Siamese",
    gender: "Female",
    age: { years: 1, months: 6 },
    size: "Small",
    labels: { temperament: ["Calm", "Independent"], goodWith: ["Elderly"] },
    adoptionStatus: "Available",
    description: "Elegant and calm cat."
  },
  {
    name: "Rocky",
    species: "Dog",
    breed: "Bulldog",
    gender: "Male",
    age: { years: 3, months: 0 },
    size: "Medium",
    labels: { temperament: ["Lazy", "Gentle"], goodWith: ["Other Dogs"] },
    adoptionStatus: "Available",
    description: "Loves to sleep and eat."
  }
];

const seedDB = async () => {
  await Pet.deleteMany({}); 
  await Pet.insertMany(pets); 
  console.log("✅ 3 Pets Added Successfully!");
  mongoose.connection.close();
};

seedDB();