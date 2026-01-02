import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ShelterLayout from "../components/ShelterLayout";
import ReactApexChart from "react-apexcharts";
import {
  startOfDay,
  subDays,
  eachDayOfInterval,
  startOfToday,
  format,
} from "date-fns";

export default function ShelterDashboard() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [dayCount, setDayCount] = useState(6);

  const availablePets = pets.filter(
    (pet) => pet.adoptionStatus === "Available"
  );

  const adoptedPets = pets.filter((pet) => pet.adoptionStatus === "Adopted");

  const pendingRequestCount = requests.filter(
    (pet) => pet.status === "Pending"
  ).length;

  const availablePetsCount = availablePets.length;
  const adoptedPetsCount = adoptedPets.length;

  const getDaysOfInterval = (totalDays) => {
    const end = startOfToday();

    const start = subDays(end, totalDays);

    return eachDayOfInterval({ start, end });
  };

  const intervalDays = getDaysOfInterval(dayCount);

  const intervalAvailablePets = intervalDays.map(
    (day) =>
      availablePets.filter(
        (pet) => startOfDay(pet.createdAt).getTime() === day.getTime()
      ).length
  );

  const intervalAdoptedPets = intervalDays.map(
    (day) =>
      adoptedPets.filter(
        (pet) => startOfDay(pet.createdAt).getTime() === day.getTime()
      ).length
  );

  const getTotalPets = () => {
    let total = pets.length;

    const result = Array.from({ length: dayCount + 1 }).map((_, index) => {
      if (!index) {
        return total;
      }

      const reverseIndex = dayCount + 1 - index;

      total =
        total -
        intervalAvailablePets[reverseIndex] -
        intervalAdoptedPets[reverseIndex];

      return total;
    });

    return result.toReversed();
  };

  const data = {
    series: [
      {
        name: "Available Pets",
        type: "column",
        data: intervalAvailablePets,
      },
      {
        name: "Adopted Pets",
        type: "column",
        data: intervalAdoptedPets,
      },
      {
        name: "Total Pets",
        type: "line",
        data: getTotalPets(),
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        stacked: false,
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        text: "Pet Adoption Analysis",
        align: "left",
      },
      xaxis: {
        categories: intervalDays.map((day) => format(day, "dd MMM yyyy")),
      },
    },
  };

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchPets();
    fetchRequests();
  };

  // --- API FUNCTIONS ---
  const fetchPets = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shelters/${SHELTER_ID}/pets`
      );
      const data = await res.json();
      if (data.success) setPets(data.pets);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shelters/${SHELTER_ID}/requests`
      );
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (SHELTER_ID) refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SHELTER_ID]);

  return (
    <ShelterLayout>
      <div className="flex-1 p-8 ml-64">
        <div className="animate-fade-in space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Pets" value={pets.length ?? 0} />
            <StatCard label="Available" value={availablePetsCount} />
            <StatCard label="Adopted" value={adoptedPetsCount} />
            <StatCard
              label="Pending Requests"
              value={pendingRequestCount}
              color="text-red-600"
            />
          </div>
          <div className="flex items-center justify-end">
            <Button
              className="rounded-l-md"
              isActive={dayCount === 6}
              onClick={() => setDayCount(6)}
            >
              7 Days
            </Button>
            <Button isActive={dayCount === 13} onClick={() => setDayCount(13)}>
              14 Days
            </Button>
            <Button isActive={dayCount === 29} onClick={() => setDayCount(29)}>
              1 Month
            </Button>
            <Button
              className="rounded-r-md"
              isActive={dayCount === 59}
              onClick={() => setDayCount(59)}
            >
              2 Months
            </Button>
          </div>
          <div className="w-full">
            <ReactApexChart
              options={data.options}
              series={data.series}
              type="line"
              height={350}
            />
          </div>
        </div>
      </div>
    </ShelterLayout>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
        {label}
      </h3>
      <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function Button({ children, onClick, className, isActive }) {
  return (
    <button
      className={`cursor-pointer border border-orange-600 py-1 px-4 ${className ?? ""} ${isActive ? "bg-orange-600 text-white" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
