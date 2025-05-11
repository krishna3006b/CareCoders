import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TiArrowLeft } from "react-icons/ti";
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from "react-router-dom";

// Dummy doctor data
const dummyDoctors = [
    {
        id: "1", // Doctor ID
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
        id: "2", // Doctor ID
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
        id: "3", // Doctor ID
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
        id: "4", // Doctor ID
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
        id: "5", // Doctor ID
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

// Form validation schema
const appointmentSchema = z.object({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    familyMember: z.string(),
    policyNumber: z.string().optional(),
});

export default function BookAppointment() {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the data passed via navigation state (for reschedule/book again)
    const prefilledData = location.state || {};

    const [selectedDoctor, setSelectedDoctor] = useState(prefilledData.doctor || null);
    const [selectedLocation, setSelectedLocation] = useState(prefilledData.location || "");
    const [selectedSpecialty, setSelectedSpecialty] = useState(prefilledData.specialty || "");
    const [filteredDoctors, setFilteredDoctors] = useState(dummyDoctors);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            date: prefilledData.date || "",
            time: prefilledData.time || "",
            familyMember: prefilledData.familyMember || "self",
            policyNumber: prefilledData.policyNumber || "",
        },
    });

    const selectedTime = watch("time");

    // Filter doctors by selected location and specialty
    useEffect(() => {
        const filtered = dummyDoctors.filter((doc) => {
            return (
                (!selectedLocation || doc.location === selectedLocation) &&
                (!selectedSpecialty || doc.specialty === selectedSpecialty)
            );
        });

        setFilteredDoctors(filtered);

        // Clear the date and time if no doctors are available after filter
        if (filtered.length === 0) {
            setValue("date", "");
            setValue("time", "");
        }
    }, [selectedLocation, selectedSpecialty, setValue]);

    const onSubmit = (data) => {
        if (!selectedDoctor) {
            toast.error("Please select a doctor before submitting the appointment.");
            return;
        }

        const submission = {
            doctor: selectedDoctor,
            ...data,
        };

        console.log("Submitted Appointment:", submission);
        toast.success("Appointment booked successfully!");
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 shadow-sm border-b border-gray-100 sticky top-0 bg-white z-10">
                <TiArrowLeft
                    className="text-2xl cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-lg font-semibold">Book Appointment</h1>
                <div className="w-6" />
            </header>

            {/* Filters */}
            <section className="p-4 bg-white border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                    {/* Location Filter */}
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="border border-gray-200 outline-none px-3 py-2 rounded-md"
                    >
                        <option value="">All Locations</option>
                        {[...new Set(dummyDoctors.map((d) => d.location))].map(
                            (loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            )
                        )}
                    </select>

                    {/* Specialty Filter */}
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="border border-gray-200 outline-none px-3 py-2 rounded-md"
                    >
                        <option value="">All Specialties</option>
                        {[...new Set(dummyDoctors.map((d) => d.specialty))].map(
                            (spec) => (
                                <option key={spec} value={spec}>
                                    {spec}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </section>

            {/* Scrollable Main */}
            <main className="flex-grow overflow-y-auto bg-gray-100 p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Doctor Selection */}
                    <section>
                        <p className="font-medium mb-2">Select a Doctor</p>
                        <div className="flex gap-4 overflow-x-auto">
                            {filteredDoctors.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoctor(doc)}
                                    className={`border border-gray-200 rounded-md p-3 min-w-[200px] cursor-pointer shadow-sm ${selectedDoctor?.id === doc.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "bg-white"
                                        }`}
                                >
                                    <img
                                        src={doc.image}
                                        alt={doc.name}
                                        className="w-12 h-12 rounded-full mb-2"
                                    />
                                    <p className="font-semibold text-sm">{doc.name}</p>
                                    <p className="text-xs text-gray-600">
                                        {doc.specialty}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Show Date and Time only if a doctor is selected */}
                    {selectedDoctor && (
                        <>
                            <section className="p-4 border-t border-gray-200 rounded-md bg-white">
                                <label className="block font-medium mb-1">
                                    Select Date
                                </label>
                                <select
                                    {...register("date")}
                                    className="w-full border border-gray-200 outline-none px-3 py-2 rounded-md"
                                >
                                    <option value="">Select Date</option>
                                    {selectedDoctor.availability.dates.map(
                                        (date) => (
                                            <option key={date} value={date}>
                                                {date}
                                            </option>
                                        )
                                    )}
                                </select>
                                {errors.date && (
                                    <p className="text-red-500 text-sm">
                                        {errors.date.message}
                                    </p>
                                )}

                                <label className="block font-medium mt-4 mb-2">
                                    Select Time
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedDoctor.availability.times.map(
                                        (slot) => (
                                            <button
                                                type="button"
                                                key={slot.slot}
                                                onClick={() =>
                                                    setValue("time", slot.slot)
                                                }
                                                className={`px-4 py-2 rounded-md text-sm border border-gray-200 ${selectedTime === slot.slot
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100"
                                                    }`}
                                            >
                                                {slot.range}
                                            </button>
                                        )
                                    )}
                                </div>
                                {errors.time && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.time.message}
                                    </p>
                                )}
                            </section>
                        </>
                    )}

                    {/* Patient Info */}
                    <section className="p-4 border-t border-gray-200 rounded-md bg-white">
                        <label className="block text-sm font-medium mb-1">
                            Family Member
                        </label>
                        <select
                            {...register("familyMember")}
                            className="w-full border border-gray-200 outline-none px-3 py-2 rounded-md mb-3"
                        >
                            <option value="self">Self</option>
                            <option value="spouse">Spouse</option>
                            <option value="child1">Child 1</option>
                        </select>
                    </section>

                    <div className="bg-white p-4 border-t border-gray-200 rounded-md">
                        <div className="flex justify-between mb-2 text-sm text-gray-700">
                            <span>Estimated Duration: 30 mins</span>
                            <span>Cost: Rs. 500</span>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm"
                        >
                            Confirm Booking
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-2">
                            By booking, you agree to our terms and conditions.
                        </p>
                    </div>
                </form>
            </main>
        </div>
    );
}