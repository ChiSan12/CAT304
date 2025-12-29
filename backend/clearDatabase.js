require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('./models/pet');
const Shelter = require('./models/shelter');
const Adopter = require('./models/adopter');

/**
 * Database Cleanup Script
 * Purpose: Clear all collections before reseeding data
 * Usage: node clearDatabase.js
 */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Connection error:', err));

const clearDatabase = async () => {
  try {
    console.log('\n  Starting database cleanup...\n');

    // Delete all pet records
    const deletedPets = await Pet.deleteMany({});
    console.log(` Deleted ${deletedPets.deletedCount} pets`);

    // Clear shelter.pet references
    await Shelter.updateMany({}, { $set: { pets: [] } });

    // Delete all shelter records
    //const deletedShelters = await Shelter.deleteMany({});
    //console.log(` Deleted ${deletedShelters.deletedCount} shelters`);

    // Delete all adopter records
    //const deletedAdopters = await Adopter.deleteMany({});
    //console.log(` Deleted ${deletedAdopters.deletedCount} adopters`);

    console.log('\n Database cleared successfully!');
    console.log(' You can now run the seed script to insert fresh data\n');

  } catch (error) {
    console.error(' Error while clearing database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

clearDatabase();
