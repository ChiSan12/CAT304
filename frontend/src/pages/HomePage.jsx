import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';
import '../styles/HomePage.css';

// --- Data for the Homepage ---

const slides = [
  { 
    id: 1, 
    img: '/images/dog_in_cage.jpg',
    title: 'TNRM', 
    subtitle: 'Trap-Neuter-Release-Manage',
    cta: 'Make a Difference Today',
  },
  { 
    id: 2, 
    img: '/images/happy_dog_family.jpg', 
    title: 'Forever Homes', 
    subtitle: 'Give a Pet a Second Chance',
    cta: 'Find Your Perfect Match',
  },
];

const featuredPets = [
  { name: "Buddy", img: '/images/dog1.jpg' }, 
  { name: "Mittens", img: '/images/cat1.jpg' },
  { name: "Pippin", img: '/images/dog2.jpg' },
];

function HomePage() {
  // --- Carousel State and Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-play the carousel
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); 
    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  // --- JSX Rendering ---
  return (
    <div className="homepage">

      {/* Hero Section with Carousel */}
      <section className="carousel-container">
        <img 
          src={slide.img} 
          alt="Featured pet for adoption" 
          className="carousel-image" 
        />

        {/* Overlay Content */}
        <div className="carousel-overlay">
          <div className="overlay-text left-content">
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
          </div>
          
          <div className="overlay-text right-content">
            <p>{slide.cta}</p>
            <button className="cta-button">Learn More</button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button className="nav-arrow prev" onClick={prevSlide}>‹</button>
        <button className="nav-arrow next" onClick={nextSlide}>›</button>
      </section>

      {/* Main Content Sections */}
      <main className="content-sections">
        
        {/* Featured Pets */}
        <section className="feature-section">
          <h2>🐾 Featured Pets</h2>
          <div className="pet-list">
            {featuredPets.map((pet) => (
              <div key={pet.name} className="pet-card">
                <img src={pet.img} alt={pet.name} />
                <p>{pet.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Mission */}
        <section className="mission-section">
          <h2>💛 Our Mission</h2>
          <p>
            At PET Found us, we're dedicated to rescuing, rehabilitating, and rehoming 
            animals in need. Every pet deserves a loving home, and we work tirelessly 
            to match compassionate families with their perfect companions. Through our 
            comprehensive TNRM program and community outreach, we're creating a better 
            world for animals one adoption at a time. Join us in our mission to make 
            every tail wag and every purr count.
          </p>
        </section>

        {/* How You Can Help */}
        <section className="help-section">
          <h2>🤝 How You Can Help</h2>
          <ul>
            <li>🏡 <strong>Adopt</strong> - Give a pet their forever home</li>
            <li>🏠 <strong>Foster</strong> - Provide temporary care and love</li>
            <li>💝 <strong>Donate</strong> - Support medical care and supplies</li>
            <li>✋ <strong>Volunteer</strong> - Share your time and skills</li>
            <li>📢 <strong>Spread the Word</strong> - Help us reach more families</li>
          </ul>
        </section>
      </main>

      {/* Contact Footer */}
      <footer className="bg-orange-50 py-16">
        <div className="max-w-md mx-auto">

          <h2 className="text-center text-3xl font-extrabold text-orange-400 mb-8">
            CONTACT US
          </h2>

          <div className="space-y-6 text-orange-400 text-lg text-left">

            <div className="flex items-center gap-4">
              <Mail size={26} />
              <span className="font-medium">
                lovemypetshaven@gmail.com
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Phone size={26} />
              <span className="font-medium">
                +6019-6632828 (Aileen)
              </span>
            </div>

            <div className="flex items-start gap-4">
              <MapPin size={26} />
              <span className="font-medium leading-relaxed">
                A-2-G, Galeri Klang Sentral, Jalan Klang Sentral 15/KU5,<br />
                41050 Klang, Selangor, Malaysia.
              </span>
            </div>

          </div>
        </div>

        {/* COPYRIGHT */}
        <p className="text-center text-sm text-gray-500 mt-12">
          © 2025 PET Found Us. All Rights Reserved. Made with 💖 for our furry friends.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;