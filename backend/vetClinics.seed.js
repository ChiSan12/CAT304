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
      name: "Gill’s Veterinary Clinic",
      address: "10-A Jalan Bagan Jermal, 10250 Penang",
      location: {
        type: "Point",
        coordinates: [100.3066, 5.4326]
      }
    },
    {
      name: "Island Vet Clinic",
      address: "381A-G-5 Jalan Perak, 11600 Penang",
      location: {
        type: "Point",
        coordinates: [100.3151, 5.3984]
      }
    },
    {
      name: "AcuVet Veterinary Speciality Clinic",
      address: "25E Jalan Gottlieb, 10350 Penang",
      location: {
        type: "Point",
        coordinates: [100.3023, 5.4301]
      }
    },
    {
      name: "Neko Inu Vet Centre",
      address: "72-1-71 Arena Curve, Jalan Mahsuri, 11900 Pulau Pinang",
      location: {
        type: "Point",
        coordinates: [100.2794, 5.3268]
      }
    },
    {
      name: "Ark Veterinary Centre",
      address: "25 Lebuh Lembah Permai 1, 11200 Pulau Pinang",
      location: {
        type: "Point",
        coordinates: [100.2831, 5.4519]
      }
    },
    {
      name: "Cuddles Vet Clinic",
      address: "150 Jalan Kelawei, 10250 Pulau Pinang",
      location: {
        type: "Point",
        coordinates: [100.3117, 5.4357]
      }
    },
    {
      name: "Gesundheit by Asia Paws",
      address: "Unit 3B-G-2 Straits Quay, 10470 Penang",
      location: {
        type: "Point",
        coordinates: [100.3134, 5.4583]
      }
    },
    {
      name: "Peng Aun Veterinary Clinic",
      address: "728 Jalan Sungai Dua, 11700 Penang",
      location: {
        type: "Point",
        coordinates: [100.2974, 5.3484]
      }
    },
    {
      name: "Dr. & Dr. Mrs. Pavabakaran",
      address: "201 Jalan Utara, 11700 Penang",
      location: {
        type: "Point",
        coordinates: [100.3045, 5.3789]
      }
    },
    {
      name: "Angsana Vet Clinic",
      address: "31A Medan Angsana, Bandar Baru Air Itam, 11500 Penang",
      location: {
        type: "Point",
        coordinates: [100.2856, 5.3952]
      }
    },
    {
      name: "Grace Veterinary Centre",
      address: "12 Jalan Pantai Jerjak, Sungai Nibong, 11900 Penang",
      location: {
        type: "Point",
        coordinates: [100.3051, 5.3411]
      }
    },
    {
      name: "Windsor Animal Hospital",
      address: "C-G-7 Desiran Vantage, Jalan Desiran Tanjong, Tanjong Tokong, 10470 Penang",
      location: {
        type: "Point",
        coordinates: [100.3075, 5.4512]
      }
    },
    {
      name: "Kitty Cat Care Clinic (Bayan Lepas)",
      address: "40A, 1st Floor, Wisma Malvest, Jalan Tun Dr Awang, 11900 Bayan Lepas",
      location: {
        type: "Point",
        coordinates: [100.2741, 5.3283]
      }
    },
    {
      name: "Happy Cats Veterinary Clinic",
      address: "1.02.05, SummerSkye Square, Jalan Sungai Tiram 8, Bayan Lepas, 11900 Pulau Pinang",
      location: {
        type: "Point",
        coordinates: [100.2691, 5.3041]
      }
    },
    {
      name: "Jabatan Haiwan",
      address: "Jalan Kampong Jawa Baru, 10100 Penang",
      location: {
        type: "Point",
        coordinates: [100.3235, 5.4095]
      }
    },
    {
      name: "Lim Animal Clinic & Kennels",
      address: "2 Lorong Sepakat 4, 14000 Bukit Mertajam",
      location: {
        type: "Point",
        coordinates: [100.4725, 5.3458]
      }
    },
    {
      name: "Hazlim Animal Clinic",
      address: "BG02 Jalan Sutera Prima, Apt Casa Prima, 13700 Seberang Prai",
      location: {
        type: "Point",
        coordinates: [100.3952, 5.3912]
      }
    },
    {
      name: "Venice Veterinary Clinic",
      address: "43 Perniagaan Gemilang 1, Bukit Mertajam",
      location: {
        type: "Point",
        coordinates: [100.4518, 5.3496]
      }
    },
    {
      name: "Dr. Anthony Animal Clinic",
      address: "2 Lorong Perniagaan 1, Bukit Mertajam",
      location: {
        type: "Point",
        coordinates: [100.4550, 5.3482]
      }
    },
    {
      name: "Pawsitive Pet Animal Clinic",
      address: "45 Lorong 22/SS1 Bandar Tasek Mutiara, 14120 Simpang Empat",
      location: {
        type: "Point",
        coordinates: [100.4851, 5.2798]
      }
    },
    {
      name: "Petsquare Veterinary Clinic",
      address: "26 Lorong Bukit Kecil Indah, Bukit Mertajam",
      location: {
        type: "Point",
        coordinates: [100.4491, 5.3401]
      }
    },
    {
      name: "Pet Wellness Veterinary Centre",
      address: "7463 Jalan Bagan Lalang, Taman Carissa Villa, Butterworth",
      location: {
        type: "Point",
        coordinates: [100.3965, 5.4371]
      }
    },
    {
      name: "Unipet Vet Clinic",
      address: "26 Lorong Seri Jaya, 14000 Butterworth",
      location: {
        type: "Point",
        coordinates: [100.4002, 5.3925]
      }
    },
    {
      name: "Kitty Cat Care Clinic (Butterworth)",
      address: "19 Jalan Sungai Dua Utama 1, 13800 Butterworth",
      location: {
        type: "Point",
        coordinates: [100.4312, 5.4435]
      }
    },
    {
      name: "J Vet Clinic",
      address: "29 Lorong Seri Impian 2, Taman Seri Impian, 14000 Butterworth",
      location: {
        type: "Point",
        coordinates: [100.4285, 5.3852]
      }
    },
    {
      name: "Klinik Haiwan Ecovet",
      address: "1981 Jalan Merbau Indah, Sg Dua, 13800 Butterworth",
      location: {
        type: "Point",
        coordinates: [100.4421, 5.4468]
      }
    },
    {
      name: "Vet Connect Animal Clinic",
      address: "19 Jalan Seri Bakap, 14200 Sungai Jawi",
      location: {
        type: "Point",
        coordinates: [100.4952, 5.2185]
      }
    },
    {
      name: "LovinCare Veterinary Medical Centre",
      address: "48 & 50, Jalan Lembah Permai 4, 14000 Bukit Mertajam",
      location: {
        type: "Point",
        coordinates: [100.4612, 5.3521]
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