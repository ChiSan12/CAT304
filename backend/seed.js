require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Pet = require('./models/pet'); 
const Shelter = require('./models/shelter');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected... Adding More Pets'))
  .catch(err => console.log(' Connection Error:', err));

const addMorePets = async () => {
  try {
    // Fetch the shelter record
    let shelter = await Shelter.findOne({ email: 'admin@petfoundus.com' });
    
    if (!shelter) {
      console.log('  Shelter not found. Creating one...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      shelter = await Shelter.create({
        name: 'Pet Found Us',
        email: 'admin@petfoundus.com',
        password: hashedPassword,
        phone: '+6016-5703369',
        location: {
          address: 'A-2-G, Pet Found Us',
          city: 'Gelugor',
          state: 'Penang'
        }
      });
    }

    console.log(` Using Shelter: ${shelter.name}`);

    //Pets Data
    const newPets = [
      {
        name: "Charlie",
        species: "Dog",
        breed: "Chow Chow",
        gender: "Male",
        age: { years: 3, months: 6 },
        size: "Medium",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Friendly", "Playful"], 
          goodWith: ["Children", "Other Dogs"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Charlie is a friendly Chow Chow who loves to play and explore. He's great with kids and gets along well with other dogs. Perfect for an active family!"
      },
      
      {
        name: "Luna",
        species: "Dog",
        breed: "Husky Mix",
        gender: "Female",
        age: { years: 2, months: 0 },
        size: "Large",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Energetic", "Friendly"], 
          goodWith: ["Other Dogs"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: false,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Beautiful Husky mix with striking blue eyes. Luna is very energetic and needs plenty of exercise. Best suited for active owners with dog experience."
      },

      {
        name: "Cooper",
        species: "Dog",
        breed: "Yorkshire Terrie",
        gender: "Male",
        age: { years: 1, months: 8 },
        size: "Small",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Playful", "Friendly"], 
          goodWith: ["Children", "Other Dogs", "Elderly"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Adorable Yorkshire Terrie with big personality! Cooper loves everyone he meets and is perfect for families or seniors looking for a loyal companion."
      },

      {
        name: "Daisy",
        species: "Dog",
        breed: "Corgi",
        gender: "Female",
        age: { years: 4, months: 0 },
        size: "Small",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Calm", "Friendly"], 
          goodWith: ["Children", "Elderly", "Single Adults"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Sweet and gentle Corgi. Daisy is perfect for apartment living and loves to cuddle on the couch."
      },

      {
        name: "Zeus",
        species: "Dog",
        breed: "Border Collie",
        gender: "Male",
        age: { years: 5, months: 6 },
        size: "Large",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Calm", "Friendly"], 
          goodWith: ["Other Dogs"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: ["Mild arthritis - requires joint supplements"]
        },
        adoptionStatus: "Available",
        description: "Majestic Border Collie looking for a peaceful retirement home. Zeus is well-trained and calm, perfect for experienced dog owners."
      },

      //Cats Data
      {
        name: "Oliver",
        species: "Cat",
        breed: "Tabby",
        gender: "Male",
        age: { years: 2, months: 3 },
        size: "Medium",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Playful", "Friendly"], 
          goodWith: ["Children", "Other Cats"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Playful tabby cat who loves toys and attention. Oliver gets along great with other cats and children. A perfect family pet!"
      },

      {
        name: "Nala",
        species: "Cat",
        breed: "Persian",
        gender: "Female",
        age: { years: 3, months: 0 },
        size: "Medium",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Calm", "Independent"], 
          goodWith: ["Single Adults", "Elderly"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Elegant Persian cat with luxurious fur. Nala is calm and prefers a quiet environment. She requires regular grooming."
      },

      {
        name: "Whiskers",
        species: "Cat",
        breed: "Domestic Shorthair",
        gender: "Male",
        age: { years: 1, months: 0 },
        size: "Small",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Playful", "Energetic"], 
          goodWith: ["Children", "Other Cats"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: false,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Young and energetic kitten full of life! Whiskers loves to play and would thrive in a home with other playful cats or active children."
      },

      {
        name: "Cleo",
        species: "Cat",
        breed: "Calico",
        gender: "Female",
        age: { years: 5, months: 0 },
        size: "Medium",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Independent", "Calm"], 
          goodWith: ["Single Adults"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Beautiful calico cat with a quiet and independent personality. Cleo prefers her own space but will show affection on her terms."
      },

      {
        name: "Mittens",
        species: "Cat",
        breed: "Maine Coon Mix",
        gender: "Female",
        age: { years: 3, months: 6 },
        size: "Large",
        shelterId: shelter._id,
        images: [{ 
          url: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=600&q=80" 
        }],
        labels: { 
          temperament: ["Friendly", "Calm"], 
          goodWith: ["Children", "Other Cats", "Elderly"] 
        },
        healthStatus: {
          vaccinated: true,
          neutered: true,
          medicalConditions: []
        },
        adoptionStatus: "Available",
        description: "Gentle giant! Mittens is a large Maine Coon mix with a sweet disposition. She's great with everyone and loves to be near her family."
      }
    ];

    const createdPets = await Pet.insertMany(newPets);
    
    // Update the shelter's pets array with newly created pet IDs
    shelter.pets = [...shelter.pets, ...createdPets.map(pet => pet._id)];
    await shelter.save();

    console.log(`\n Successfully added ${createdPets.length} new pets!`);
    console.log('\n New Pets List:');

    // Log details of each newly added pet
    createdPets.forEach(pet => {
      console.log(`   - ${pet.name} (${pet.species}, ${pet.breed}, ${pet.size})`);
    });

    // Log total number of pets under the shelter
    console.log(`\n Total pets in ${shelter.name}: ${shelter.pets.length}`);
    
    // Close database connection after operation
    mongoose.connection.close();
    console.log('\n Done! Run your app to see the new pets!');
    
  } catch (error) {
    console.error(' Error adding pets:', error);

    // Ensure database connection is closed on error
    mongoose.connection.close();
  }
};

addMorePets();