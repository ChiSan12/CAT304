import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function HomePage({ goTo }) {
  return (
    <div className="w-full">
      <section
        className="relative h-[100vh] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/homepage.jpg')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-xl text-white">
            <p className="text-3xl font-semibold tracking-wide mb-4">
              Save your next
            </p>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              BEST FRIEND
            </h1>

            <p className="mt-6 text-lg text-gray-200 text-xl">
              Connecting Shelters, Adopters & Communities
            </p>

            <div className="mt-8 flex gap-4">
              <NavLink
                to="/pets"
                className="px-8 py-4 bg-gray-300 text-gray-900 text-base rounded-lg font-bold hover:bg-gray-200 transition"
              >
                🐾 Find a Pet
              </NavLink>

              <NavLink
                to="/report"
                className="px-8 py-4 bg-yellow-400 text-gray-900 text-base rounded-xl font-bold hover:bg-yellow-500 transition"
              >
                📍 Report a Stray
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">What We Do</h2>

          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            PET Found Us is a smart pet rescue & rehoming platform for safer,
            more compassionate cities.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="🧠 Smart Pet Matching"
              text="Match adopters with pets based on lifestyle and compatibility score."
            />
            <FeatureCard
              title="📍 Stray Animal Reporting"
              text="Report stray cats and dogs with real-time location tracking."
            />
            <FeatureCard
              title="🐕 Adoption Management"
              text="Centralised pet listings and adoption request handling."
            />
            <FeatureCard
              title="❤️ Post-Adoption Support"
              text="Health reminders and veterinary clinic recommendations."
            />
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY IMPACT ================= */}
      <section className="py-20 bg-orange-50 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Why It Matters</h2>

        <p className="mt-6 max-w-5xl mx-auto text-xl text-gray-700">
          Thousands of stray animals face neglect and abandonment every year.
          PET Found Us connects shelters, adopters and communities to improve
          rescue efficiency and long-term animal welfare.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Stat number="120+" label="Pets Rescued" />
          <Stat number="80+" label="Successful Adoptions" />
          <Stat number="200+" label="Stray Reports Logged" />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto text-xl">
          <Step text="Create an account" />
          <Step text="Browse pets or get Smart Pet recommendations" />
          <Step text="Send adoption request or report a stray" />
          <Step text="Shelter reviews & responds" />
          <Step text="Post-adoption health tracking continues" />
        </div>
      </section>

      {/* =======FOOTER========== */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          {/* TITLE */}
          <h2 className="text-xl md:text-2xl font-bold mb-10 tracking-wide">
            CONTACT US
          </h2>

          {/* CONTACT INFO */}
          <div className="space-y-6 text-sm md:text-base text-left">
            <div className="flex items-center gap-4">
              <Mail size={26} />
              <span className="font-medium">admin@petfoundus.com</span>
            </div>

            <div className="flex items-center gap-4">
              <Phone size={26} />
              <span className="font-medium">+60165703369</span>
            </div>

            <div className="flex items-start gap-4">
              <MapPin size={26} />
              <span className="font-medium leading-relaxed max-w-xl">
                A-2-G, Pet Found Us,
                <br />
                Gelugor, Penang.
              </span>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <p className="text-center text-sm text-gray-400 mt-16">
          © 2025 PET Found Us. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function FeatureCard({ title, text }) {
  return (
    <div className="p-6 border rounded-2xl hover:shadow-md transition">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <p className="text-2xl font-bold text-orange-600">{number}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function Step({ text }) {
  return (
    <div className="p-4 rounded-xl bg-orange-50 text-sm text-gray-700">
      {text}
    </div>
  );
}
