import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  PawPrint,
  HeartHandshake,
  Users,
  HeartPulse,
  AlertTriangle,
} from "lucide-react";
import HomeCareReminderPreview from "../components/HomeCareReminderPreview";

export default function HomePage({ goTo }) {
  const [contact, setContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);

  useEffect(() => {
   fetch("http://localhost:5000/api/shelters/public/contact")
     .then(res => res.json())
     .then(data => {
        if (data.success) {
         setContact(data.contact);
        }
       setContactLoading(false);
     })
     .catch(() => setContactLoading(false));
  }, []);

  return (
    <div className="w-full">
      <section className="
        relative 
        min-h-[60vh] 
        max-h-[700px]
        bg-cover 
        bg-center
        "
        style={{ backgroundImage: "url('/images/homepage.webp')" }}
      >

        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center min-h-screen">
          <div className="max-w-2xl text-white">
            <p className="text-3xl md:text-4xl font-semibold mb-4 opacity-90 tracking-wide">
              Save your next
            </p>

            <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
              BEST FRIEND
            </h1>

            <p className="mt-8 text-xl md:text-2xl text-gray-100 font-light tracking-wide">
              Connecting Shelter, Adopters & Communities
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <NavLink
                to="/pets"
                className="group px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <PawPrint size={20} className="group-hover:rotate-12 transition-transform" />
                Find a Pet
              </NavLink>

              <NavLink
                to="/report"
                className="group px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <AlertTriangle size={20} className="group-hover:animate-pulse" />
                Report a Stray
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION SECTION ================= */}
      <section className="bg-gradient-to-b from-[#FFF7ED] to-orange-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 space-y-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="font-bold text-lg text-orange-600 flex items-center gap-2 pb-3 border-b-2 border-orange-300">
              <PawPrint size={20} />
              What We Do
            </h3>

            <FeatureCard
              icon={PawPrint}
              title="Smart Pet Matching"
              text="Match adopters with pets based on lifestyle and compatibility score."
            />

            <FeatureCard
              icon={MapPin}
              title="Stray Animal Reporting"
              text="Report stray cats and dogs with real-time location tracking."
            />
            <FeatureCard
              icon={HeartPulse}
              title="Adoption Management"
              text="Centralised pet listings and adoption handling."
            />

            <FeatureCard
              icon={AlertTriangle}
              title="Post-Adoption Support"
              text="Health reminders and clinic recommendations."
            />
          </div>

          {/* CENTER COLUMN */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col border border-orange-100">
            <h2 className="text-3xl font-bold text-orange-500 mb-6 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <HeartHandshake size={28} />
              </div>
              Our Mission
            </h2>

            <p className="text-xl text-gray-700 leading-relaxed font-medium mb-10">
              PET Found Us is a smart pet rescue & rehoming platform for safer,
              more compassionate cities.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
              Why It Matters
            </h3>

            <p className="text-gray-700 leading-relaxed text-lg mb-10">
              Thousands of stray animals face neglect and abandonment every year.
              PET Found Us connects shelter, adopters and communities to improve
              rescue efficiency and long-term animal welfare.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <Stat number="120+" label="Pets Rescued" />
              <Stat number="80+" label="Successful Adoptions" />
              <Stat number="200+" label="Stray Reports Logged" />
            </div>

            {/* ================= CARE REMINDER NOTIFICATION ================= */}
            <div className="lg:col-span-12 flex justify-center mt-10">
              <div className="w-full max-w-3xl bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
                <h3 className="text-xl font-bold text-orange-500 mb-6">
                  🩺 Care Reminders
                </h3>

                <HomeCareReminderPreview />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 space-y-4 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <h3 className="font-bold text-lg text-orange-600 flex items-center gap-2 pb-3 border-b-2 border-orange-300">
              <Users size={20} />
              How It Works
            </h3>
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <InfoCard number="1" text="Create an account and complete your profile informations" />
              <InfoCard number="2" text="Browse pets or get Smart Pet recommendations" />
              <InfoCard number="3" text="Send adoption request or report a stray" />
              <InfoCard number="4" text="Shelter reviews & responds" />
              <InfoCard number="5" text="Post-adoption health tracking continues" />
            </div>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-10 tracking-wide">
            CONTACT US
          </h2>

          {/* <div className="space-y-6 text-left">
            <div className="flex items-center gap-4">
              <Mail size={24} />
              <span>admin@petfoundus.com</span>
            </div>

            <div className="flex items-center gap-4">
              <Phone size={24} />
              <span>+60165703369</span>
            </div>

            <div className="flex items-start gap-4">
              <MapPin size={24} />
              <span>
                A-2-G, Pet Found Us,
                <br />
                Gelugor, Penang.
              </span>
            </div>
          </div> */}
          <div className="space-y-6 text-left">
            {contactLoading && (
              <p className="text-gray-400 text-sm">Loading contact info…</p>
            )}

            {contact && (
              <>
                <div className="flex items-center gap-4">
                  <Mail size={24} />
                  <span>{contact.email}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Phone size={24} />
                  <span>{contact.phone}</span>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin size={24} />
                  <span>{contact.address}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-16">
          © 2025 PET Found Us. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FeatureCard({ title, text, icon: Icon }) {
  return (
    <div className="group bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-md hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-100 rounded-xl group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-300">
          <Icon size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ text, number }) {
  return (
    <div className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-4 border-2 border-transparent hover:border-orange-200">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
        {number}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed pt-1">{text}</p>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="group bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border-2 border-orange-200 hover:border-orange-400">
      <p className="text-2xl font-extrabold text-orange-500 group-hover:scale-110 transition-transform inline-block">
        {number}
      </p>
      <p className="mt-3 text-sm font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}