require('dotenv').config();
const mongoose = require('mongoose');
const Adopter = require('./models/adopter');
const Pet = require('./models/pet');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected. Scanning for ghost requests...'))
  .catch(err => console.log(err));

const cleanGhosts = async () => {
  try {
    const adopters = await Adopter.find({});
    let removedCount = 0;

    for (const adopter of adopters) {
      const originalCount = adopter.adoptionRequests.length;
      
      // Filter out requests where the Pet ID no longer exists in the Pets collection
      const validRequests = [];
      for (const req of adopter.adoptionRequests) {
        const petExists = await Pet.findById(req.petId);
        if (petExists) {
          validRequests.push(req);
        } else {
          console.log(`👻 Found Ghost Request for missing Pet ID: ${req.petId}`);
        }
      }

      // If we found ghosts, update the user
      if (validRequests.length < originalCount) {
        adopter.adoptionRequests = validRequests;
        await adopter.save();
        removedCount += (originalCount - validRequests.length);
      }
    }

    console.log(`\n✨ Success! Removed ${removedCount} broken requests.`);
    console.log('👉 Refresh your User Dashboard. The error will be gone.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

cleanGhosts();