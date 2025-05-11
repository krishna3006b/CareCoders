// Update imports at the top
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TiArrowLeft } from "react-icons/ti";
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from "react-router-dom";
import { addBooking, setError, setLoading } from "../slices/bookingSlice";
import { setDoctors } from "../slices/doctorsSlice";
import { apiConnector } from "../services/apiConnector";

// Update the validation schema
const appointmentSchema = z.object({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    familyMember: z.string().min(1, "Please select a patient"),
});

// Helper function to format time
const formatTimeSlot = (time) => {
    return time.replace(':00', '')
        .toUpperCase();
};

export default function BookAppointment() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const backendUrl = import.meta.env.VITE_API_URL;

    const { user, token } = useSelector(state => state.user);
    const { doctors, locations, specialties, loading } = useSelector(state => state.doctors);
    const { profileData } = useSelector(state => state.profile);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(appointmentSchema)
    });

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

    useEffect(() => {
        const currentDate = new Date();

        const filtered = doctors.filter((doc) => {
            const matchesLocation = !selectedLocation ||
                doc.clinicLocation?.address === selectedLocation;
            const matchesSpecialty = !selectedSpecialty ||
                doc.specialties?.includes(selectedSpecialty);

            // Filter available slots after current date/time
            const hasAvailableSlots = doc.availableSlots?.some(slot => {
                const slotDateTime = new Date(`${slot.date} ${slot.start}`);
                return slotDateTime > currentDate;
            });

            return matchesLocation && matchesSpecialty && hasAvailableSlots;
        });

        setFilteredDoctors(filtered);
    }, [doctors, selectedLocation, selectedSpecialty]);

    // Filter doctors based on location, specialty and availability
    useEffect(() => {
        const currentDate = new Date();
        const filtered = doctors.filter((doc) => {
            const matchesLocation = !selectedLocation ||
                doc.clinicLocation?.address.toLowerCase() === selectedLocation.toLowerCase();

            const matchesSpecialty = !selectedSpecialty ||
                doc.specialties?.some(specialty =>
                    specialty.toLowerCase() === selectedSpecialty.toLowerCase()
                );

            const hasAvailableSlots = doc.availableSlots?.some(slot => {
                const [year, month, day] = slot.date.split('-');
                const [hours, minutes] = slot.start.split(':');
                const slotDateTime = new Date(year, month - 1, day, hours, minutes);
                return slotDateTime > currentDate;
            });

            return matchesLocation && matchesSpecialty && hasAvailableSlots;
        });

        setFilteredDoctors(filtered);
    }, [doctors, selectedLocation, selectedSpecialty]);

    // Update available slots when doctor is selected
    useEffect(() => {
        if (selectedDoctor) {
            const currentDate = new Date();
            const availableSlots = selectedDoctor.availableSlots?.filter(slot => {
                const slotDateTime = new Date(`${slot.date} ${slot.start}`);
                return slotDateTime > currentDate;
            });
            setAvailableSlots(availableSlots || []);
        }
    }, [selectedDoctor]);

    const onSubmit = async (data) => {
        if (!selectedDoctor) {
            toast.error("Please select a doctor");
            return;
        }

        // Find the selected slot
        const selectedSlot = selectedDoctor.availableSlots.find(
            slot => slot.date === data.date && slot.start === data.time
        );

        if (!selectedSlot) {
            toast.error("Selected time slot is not available");
            return;
        }

        dispatch(setLoading(true));
        try {
            // Format the appointment time properly
            const appointmentDateTime = new Date(`${data.date}T${data.time}`);
            
            const bookingData = {
                doctorId: selectedDoctor._id,
                patientId: profileData._id,
                familyMemberName: data.familyMember,
                appointmentTime: appointmentDateTime.toISOString(),
                specialty: selectedDoctor.specialties[0],
                slotInfo: {
                    date: data.date,
                    start: data.time,
                    end: selectedSlot.end
                }
            };

            const response = await apiConnector(
                "POST",
                `${backendUrl}/bookings`,
                bookingData,
                {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Failed to book appointment");
            }

            dispatch(addBooking(response.data.data.booking));
            toast.success("Appointment booked successfully!");
            navigate("/appointments");
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
        } finally {
            dispatch(setLoading(false));
        }
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
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="border border-gray-200 outline-none px-3 py-2 rounded-md"
                    >
                        <option value="">All Locations</option>
                        {locations?.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>

                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="border border-gray-200 outline-none px-3 py-2 rounded-md"
                    >
                        <option value="">All Specialties</option>
                        {specialties.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto bg-gray-100 p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Doctor Selection */}
                    <section>
                        <p className="font-medium mb-2">Select a Doctor</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredDoctors.map((doc) => (
                                <div
                                    key={doc._id}
                                    onClick={() => setSelectedDoctor(doc)}
                                    className={`border border-gray-200 rounded-md p-3 cursor-pointer ${selectedDoctor?._id === doc._id ? "border-blue-500 bg-blue-50" : "bg-white"
                                        }`}
                                >
                                    <img
                                        src={doc.image || `https://api.dicebear.com/8.x/initials/svg?seed=${doc.name}`}
                                        alt={doc.name}
                                        className="w-12 h-12 rounded-full mb-2"
                                    />
                                    <p className="font-semibold text-sm">{doc.name}</p>
                                    <p className="text-xs text-gray-600">{doc.specialties.join(", ")}</p>
                                    <p className="text-xs text-gray-600">{doc.clinicLocation?.address}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Appointment Details */}
                    {selectedDoctor && (
                        <section className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-medium mb-4">Select Appointment Time</h3>

                            {/* Family Member Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Patient Name</label>
                                <select
                                    {...register("familyMember")}
                                    className="w-full border border-gray-200 rounded-md p-2"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select patient</option>
                                    {/* Self option */}
                                    {profileData?.name && (
                                        <option value={profileData.name}>Self ({profileData.name})</option>
                                    )}
                                    {/* Family members */}
                                    {profileData?.familyMembers?.map((member) => (
                                        <option key={member._id} value={member.name}>
                                            {member.name} ({member.relationship})
                                        </option>
                                    ))}
                                </select>
                                {errors.familyMember && (
                                    <p className="text-red-500 text-sm mt-1">{errors.familyMember.message}</p>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <select
                                    {...register("date")}
                                    className="w-full border border-gray-200 rounded-md p-2"
                                >
                                    <option value="">Select Date</option>
                                    {[...new Set(availableSlots.map(slot => slot.date))].map(date => (
                                        <option key={date} value={date}>
                                            {new Date(date).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                                {errors.date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                                )}
                            </div>

                            {/* Time Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Time</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {watch("date") && availableSlots
                                        .filter(slot => slot.date === watch("date"))
                                        .sort((a, b) => {
                                            const timeA = new Date(`${a.date} ${a.start}`);
                                            const timeB = new Date(`${b.date} ${b.start}`);
                                            return timeA - timeB;
                                        })
                                        .map(slot => (
                                            <button
                                                key={`${slot.date}-${slot.start}`}
                                                type="button"
                                                onClick={() => {
                                                    setValue("time", slot.start);
                                                    setValue("endTime", slot.end);
                                                }}
                                                className={`p-2 text-sm rounded-md border transition-colors ${watch("time") === slot.start
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "hover:border-blue-300"
                                                    }`}
                                            >
                                                {formatTimeSlot(slot.start)} - {formatTimeSlot(slot.end)}
                                            </button>
                                        ))}
                                </div>
                                {errors.time && (
                                    <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!selectedDoctor}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
                    >
                        Book Appointment
                    </button>
                </form>
            </main>
        </div>
    );
}