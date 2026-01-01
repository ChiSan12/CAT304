import express from "express";
import VeterinaryClinic from "../models/VeterinaryClinic.js";

const router = express.Router();
app.use("/api/vets", vetsRoutes);

router.get("/nearby", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Location required" });
  }

  const clinics = await VeterinaryClinic.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: 8000 // 8km (Penang friendly)
      }
    }
  });

  res.json(clinics);
});

export default router;