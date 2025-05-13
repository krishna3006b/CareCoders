import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { setLoading, setError, setDoctors } from "../slices/doctorsSlice";
import { apiConnector } from "../services/apiConnector";
import toast from "react-hot-toast";

export default function DoctorList() {

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);

    const dispatch = useDispatch();
    const { doctors, loading, error } = useSelector(state => state.doctors);
    const { token } = useSelector(state => state.user);
    const backendUrl = import.meta.env.VITE_API_URL;

    const specialtyCards = [
        { id: 1, name: 'Cardiologist', icon: '❤️' },
        { id: 2, name: 'Neurologist', icon: '🧠' },
        { id: 3, name: 'Orthopedic', icon: '🦴' },
        { id: 4, name: 'Eye Specialist', icon: '👁️' },
        { id: 5, name: 'Dentist', icon: '🦷' },
        { id: 6, name: 'Pediatrician', icon: '👶' },
        { id: 7, name: 'Dermatologist', icon: '🔬' },
        { id: 8, name: 'Gynecologist', icon: '🏥' },
    ];

    useEffect(() => {
        const fetchDoctors = async () => {
            dispatch(setLoading(true));
            try {
                const response = await apiConnector(
                    "GET",
                    `${backendUrl}/doctors`,
                    null,
                    {
                        Authorization: `Bearer ${token}`
                    }
                );

                if (!response.data.success) {
                    throw new Error(response.message);
                }

                dispatch(setDoctors(response.data.doctors));
            } catch (err) {
                dispatch(setError(err.message));
                toast.error(err.message);
            }
        };

        fetchDoctors();
    }, [dispatch, token, backendUrl]);


    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const matchesSearch =
            doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.clinicLocation?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialties?.some(specialty =>
                specialty.toLowerCase().includes(searchQuery.toLowerCase())
            );

        const matchesSpecialty = selectedSpecialty
            ? doctor.specialties?.includes(selectedSpecialty)
            : true;

        return matchesSearch && matchesSpecialty;
    });

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const groupAvailabilityByDate = (dates, times, isDetailed = false) => {
        const groupedSlots = dates.reduce((acc, date) => {
            const formattedDate = formatDate(date);
            if (!acc[formattedDate]) {
                acc[formattedDate] = [];
            }
            acc[formattedDate].push(...times);
            return acc;
        }, {});

        const formattedSlots = Object.entries(groupedSlots).map(([date, timeSlots]) => {
            const timesString = timeSlots.length <= 2 || isDetailed
                ? timeSlots.map(t => t.range).join(", ")
                : `${timeSlots[0].range}, ${timeSlots[1].range} +${timeSlots.length - 2} more`;

            return `${date} ${timesString}`;
        });

        if (!isDetailed && formattedSlots.length > 2) {
            return [...formattedSlots.slice(0, 2), `+${formattedSlots.length - 2} more`];
        }

        return formattedSlots;
    };

    const formatTimeSlots = (times, isDetailed = false) => {
        if (isDetailed) {
            return times.map(time => time.range).join(", ");
        }
        if (times.length <= 2) {
            return times.map(time => time.range).join(", ");
        }
        return `${times[0].range}, ${times[1].range} +${times.length - 2}`;
    };

    const handleSpecialtyClick = (specialty) => {
        setSelectedSpecialty(specialty === selectedSpecialty ? null : specialty);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="flex flex-col h-screen">
            <Header />

            <main className="flex-grow p-4 overflow-y-auto">
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name, location or specialty"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {specialtyCards?.map((specialty) => (
                        <div
                            key={specialty.id}
                            onClick={() => handleSpecialtyClick(specialty.name)}
                            className={`cursor-pointer flex-1 flex flex-col items-center justify-center p-4 rounded-lg transition-all ${selectedSpecialty === specialty.name
                                ? 'bg-blue-100 scale-95'
                                : 'bg-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-2xl mb-2">{specialty.icon}</span>
                            <span className="text-xs text-center font-medium text-gray-600">
                                {specialty.name}
                            </span>
                        </div>
                    ))}
                </div>

                {filteredDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <div
                                key={doctor._id}
                                className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-4"
                            >
                                <div className="w-full flex flex-row flex-wrap justify-between">
                                    <div className="flex flex-wrap gap-4 items-start sm:items-center">
                                        <img
                                            src={doctor.image || `https://api.dicebear.com/8.x/initials/svg?seed=${doctor.name}`}
                                            alt={doctor.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                {doctor.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {doctor.specialties?.join(", ")}
                                            </p>
                                            <div className="flex flex-col gap-2 text-xs text-gray-600 mt-1">
                                                <div className="flex gap-2 items-center">
                                                    <MdLocationOn className="text-blue-500" />
                                                    <span>{doctor.clinicLocation?.address}</span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <FaCalendarAlt className="text-blue-500" />
                                                    <div className="flex flex-col">
                                                        {groupAvailabilityByDate(
                                                            doctor.availableSlots?.map(slot => slot.date) || [],
                                                            doctor.availableSlots?.map(slot => ({
                                                                range: `${slot.start} to ${slot.end}`,
                                                                slot: `${slot.start} - ${slot.end}`
                                                            })) || []
                                                        ).map((slot, index) => (
                                                            <span key={index}>{slot}</span>
                                                        ))}
                                                    </div>
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
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No doctors available</p>
                    </div>
                )}
            </main>
            <Footer />
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-9/12 lg:w-1/3 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500 text-2xl"
                            onClick={() => setSelectedDoctor(null)}
                        >
                            &times;
                        </button>
                        <div className="flex gap-4">
                            <img
                                src={selectedDoctor.image || `https://api.dicebear.com/8.x/initials/svg?seed=${selectedDoctor.name}`}
                                alt={selectedDoctor.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <div className="flex flex-col flex-1">
                                <h2 className="text-2xl font-semibold mb-2">{selectedDoctor.name}</h2>
                                <p className="text-lg mb-4">
                                    <strong>Specialties:</strong> {selectedDoctor.specialties?.join(", ")}
                                </p>
                                <p className="text-lg mb-4">
                                    <strong>Location:</strong> {selectedDoctor.clinicLocation?.address}
                                </p>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-lg">Available Slots:</h4>
                                    <div className="mt-2">
                                        {groupAvailabilityByDate(
                                            selectedDoctor.availableSlots?.map(slot => slot.date) || [],
                                            selectedDoctor.availableSlots?.map(slot => ({
                                                range: `${slot.start} to ${slot.end}`,
                                                slot: `${slot.start} - ${slot.end}`
                                            })) || [],
                                            true
                                        ).map((slot, index) => (
                                            <p key={index} className="text-gray-600 mb-2">{slot}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}