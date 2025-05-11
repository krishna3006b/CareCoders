import React, { useState } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import Header from "../components/Header";
import Footer from "../components/Footer";

const dummyDoctors = [
    {
        id: "1",
        name: "Dr. Emily Johnson",
        specialty: "Cardiologist",
        location: "New York",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        availability: {
            dates: ["2025-05-12", "2025-05-14"],
            times: [
                { range: "11:00 AM to 1:00 PM", slot: "11:00 AM - 1:00 PM" },
                { range: "3:00 PM to 5:00 PM", slot: "3:00 PM - 5:00 PM" },
            ],
        },
    },
    {
        id: "2",
        name: "Dr. John Smith",
        specialty: "Dermatologist",
        location: "Los Angeles",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        availability: {
            dates: ["2025-05-13", "2025-05-15"],
            times: [
                { range: "9:00 AM to 11:00 AM", slot: "9:00 AM - 11:00 AM" },
                { range: "2:00 PM to 4:00 PM", slot: "2:00 PM - 4:00 PM" },
            ],
        },
    },
    {
        id: "3",
        name: "Dr. Sarah Williams",
        specialty: "Neurologist",
        location: "Chicago",
        image: "https://randomuser.me/api/portraits/women/46.jpg",
        availability: {
            dates: ["2025-05-12", "2025-05-16"],
            times: [
                { range: "10:00 AM to 12:00 PM", slot: "10:00 AM - 12:00 PM" },
                { range: "1:00 PM to 3:00 PM", slot: "1:00 PM - 3:00 PM" },
            ],
        },
    },
    {
        id: "4",
        name: "Dr. Robert Brown",
        specialty: "Orthopedic",
        location: "Miami",
        image: "https://randomuser.me/api/portraits/men/47.jpg",
        availability: {
            dates: ["2025-05-14", "2025-05-17"],
            times: [
                { range: "8:00 AM to 10:00 AM", slot: "8:00 AM - 10:00 AM" },
                { range: "4:00 PM to 6:00 PM", slot: "4:00 PM - 6:00 PM" },
            ],
        },
    },
    {
        id: "5",
        name: "Dr. Lisa Turner",
        specialty: "Pediatrician",
        location: "San Francisco",
        image: "https://randomuser.me/api/portraits/women/48.jpg",
        availability: {
            dates: ["2025-05-10", "2025-05-13"],
            times: [
                { range: "8:30 AM to 10:30 AM", slot: "8:30 AM - 10:30 AM" },
                { range: "3:00 PM to 5:00 PM", slot: "3:00 PM - 5:00 PM" },
            ],
        },
    },
];

export default function DoctorList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
    };

    const filteredDoctors = dummyDoctors.filter((doctor) => {
        return (
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <Header />

            {/* Main Content (Scrollable Doctors List) */}
            <main className="flex-grow p-4 overflow-y-auto">
                {/* Search Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name, location or specialty"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Doctors List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-4"
                        >
                            <div className="w-full flex flex-row flex-wrap justify-between">
                                <div className="flex flex-wrap gap-4 items-start sm:items-center">
                                    <img
                                        src={doctor.image}
                                        alt={doctor.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            {doctor.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">{doctor.specialty}</p>
                                        <div className="flex flex-col gap-2 text-xs text-gray-600 mt-1">
                                            <div className="flex gap-2 items-center">
                                                <FaCalendarAlt className="text-blue-500" />
                                                <span>{doctor.availability.dates.join(", ")}</span>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <FaClock className="text-blue-500" />
                                                <span>
                                                    {doctor.availability.times
                                                        .map((time) => time.range)
                                                        .join(", ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700 h-fit w-fit">
                                    Available
                                </span>
                            </div>

                            <div className="w-full flex flex-wrap gap-2 justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                                <button
                                    onClick={() => handleDoctorClick(doctor)}
                                    className="flex items-center gap-1 text-blue-600"
                                >
                                    <BsInfoCircleFill /> Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-9/12 lg:w-1/3 relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 text-gray-500 text-2xl"
                            onClick={() => setSelectedDoctor(null)}
                        >
                            &times;
                        </button>
                        <div className="flex gap-4">
                            {/* Doctor Image in Modal */}
                            <img
                                src={selectedDoctor.image}
                                alt={selectedDoctor.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-semibold mb-2">{selectedDoctor.name}</h2>
                                <p className="text-lg mb-4">
                                    <strong>Specialty:</strong> {selectedDoctor.specialty}
                                </p>
                                <p className="text-lg mb-4">
                                    <strong>Location:</strong> {selectedDoctor.location}
                                </p>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-lg">Available Dates:</h4>
                                    <ul className="list-disc pl-5">
                                        {selectedDoctor.availability.dates.map((date) => (
                                            <li key={date} className="text-gray-600">{date}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-lg">Available Times:</h4>
                                    <ul className="list-disc pl-5">
                                        {selectedDoctor.availability.times.map((time) => (
                                            <li key={time.slot} className="text-gray-600">{time.range}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}