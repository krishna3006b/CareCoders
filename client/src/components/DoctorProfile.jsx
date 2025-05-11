import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Footer from "./Footer";
import Header from "./Header";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setProfileData, updateProfileData, setLoading, setError } from "../slices/profileSlice";
import { apiConnector } from "../services/apiConnector";

const getMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const timeOverlap = (slot1, slot2) => {
    // Convert date and time strings to Date objects for comparison
    const date1 = new Date(slot1.date);
    const date2 = new Date(slot2.date);

    // If dates are different, no overlap
    if (date1.getTime() !== date2.getTime()) {
        return false;
    }

    // Convert time strings to minutes for easier comparison
    const getMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const start1 = getMinutes(slot1.start);
    const end1 = getMinutes(slot1.end);
    const start2 = getMinutes(slot2.start);
    const end2 = getMinutes(slot2.end);

    // Check if end time is after start time for each slot
    if (end1 <= start1 || end2 <= start2) {
        return true; // Invalid time range
    }

    // Check for overlap
    return (start1 < end2 && end1 > start2);
};

export default function DoctorProfile() {

    const [editing, setEditing] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { token } = useSelector(state => state?.user);
    const profile = useSelector((state) => state.profile.profileData);
    const loading = useSelector((state) => state.profile.loading);
    const error = useSelector((state) => state.profile.error);

    const slotSchema = z.object({
        date: z.string().min(1, "Date is required"),
        start: z.string().min(1, "Start time is required"),
        end: z.string().min(1, "End time is required"),
    });

    const doctorSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(1, "Phone is required"),
        bio: z.string().optional(),
        education: z.string().optional(),
        experience: z.string().optional(),
        specialties: z.array(z.string().min(1, "Specialty is required")),
        clinicLocation: z.object({
            address: z.string().min(1, "Address is required"),
            lat: z.number().nullable().optional(),
            lng: z.number().nullable().optional(),
        }),
        availableSlots: z.array(
            z.object({
                date: z.string().min(1, "Date is required"),
                start: z.string().min(1, "Start time is required"),
                end: z.string().min(1, "End time is required")
            })
        ).refine((slots) => {
            // Sort slots by date and start time
            const sortedSlots = [...slots].sort((a, b) => {
                const dateCompare = new Date(a.date) - new Date(b.date);
                if (dateCompare === 0) {
                    return getMinutes(a.start) - getMinutes(b.start);
                }
                return dateCompare;
            });

            // Check each slot against subsequent slots
            for (let i = 0; i < sortedSlots.length; i++) {
                // Validate individual slot time range
                const currentSlot = sortedSlots[i];
                const [startHour, startMinute] = currentSlot.start.split(':').map(Number);
                const [endHour, endMinute] = currentSlot.end.split(':').map(Number);
                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;

                // Check if end time is after start time
                if (endMinutes <= startMinutes) {
                    return false;
                }

                // Check for overlap with other slots
                for (let j = i + 1; j < sortedSlots.length; j++) {
                    if (timeOverlap(sortedSlots[i], sortedSlots[j])) {
                        return false;
                    }
                }
            }
            return true;
        }, "Time slots are invalid or overlapping. Please ensure:\n- End time is after start time\n- No overlapping slots on the same day"),
    });

    const {
        control,
        handleSubmit,
        register,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(doctorSchema),
        defaultValues: profile || {},
    });

    const backendUrl = import.meta.env.VITE_API_URL;

    const fetchProfile = async () => {
        try {
            console.log("User: ", user);
            if (!user?.id) {
                throw new Error("User not authenticated");
            }
            const response = await apiConnector(
                "GET",
                `${backendUrl}/doctors/profile/${user.id}`,
                null,
                {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            );
            if (response.data.success) {
                return response.data.doctor;
            }
            throw new Error(response.data.message);
        } catch (error) {
            throw new Error(error.message || "Failed to fetch profile");
        }
    };

    const updateProfile = async (profileData) => {
        try {
            if (!user?.id) {
                throw new Error("User not authenticated");
            }
            const response = await apiConnector(
                "PUT",
                `${backendUrl}/doctors/profile/${user.id}`,
                profileData,
                {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            );
            if (response.data.success) {
                return response.data.doctor;
            }
            throw new Error(response.data.message);
        } catch (error) {
            throw new Error(error.message || "Failed to update profile");
        }
    };

    useEffect(() => {
        if (!user) {
            toast.error("Please login to view profile");
            return;
        }

        const loadProfile = async () => {
            dispatch(setLoading(true));
            try {
                const data = await fetchProfile();
                dispatch(setProfileData(data));
                reset(data);
            } catch (err) {
                dispatch(setError(err.message));
                toast.error(err.message);
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (!profile) {
            loadProfile();
        } else {
            reset(profile);
        }
    }, [dispatch, reset, profile, user]);

    const handleError = (errors) => {
        if (errors.availableSlots?.message === "Time slots are overlapping") {
            toast.error("Time slots are overlapping!");
        } else {
            toast.error("Please fix form errors before submitting.");
        }
    };

    const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
        control,
        name: "specialties",
    });

    const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
        control,
        name: "availableSlots",
    });

    const handleSave = async (data) => {
        dispatch(setLoading(true));
        try {
            const updatedProfile = await updateProfile(data);
            dispatch(updateProfileData(updatedProfile));
            toast.success("Profile updated successfully!");
            setEditing(false);
        } catch (err) {
            dispatch(setError(err.message));
            toast.error(err.message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleAddressChange = async (address) => {
        setValue("clinicLocation.address", address);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await res.json();
            if (data[0]) {
                setValue("clinicLocation.lat", parseFloat(data[0].lat));
                setValue("clinicLocation.lng", parseFloat(data[0].lon));
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
        }
    };

    if (!user) return <div>Please login to view profile</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>No profile found.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow p-6 pb-20">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Doctor Profile</h2>
                    {!editing ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileRow label="Name" value={profile.name} />
                                <ProfileRow label="Email" value={profile.email} />
                                <ProfileRow label="Phone" value={profile.phone} />
                                <ProfileRow label="Bio" value={profile.bio || "Not provided"} />
                                <ProfileRow label="Education" value={profile.education || "Not provided"} />
                                <ProfileRow label="Experience" value={profile.experience || "Not provided"} />
                                <ProfileRow
                                    label="Specialties"
                                    value={profile.specialties?.length ? profile.specialties.join(", ") : "None specified"}
                                />
                                <ProfileRow
                                    label="Clinic Address"
                                    value={profile.clinicLocation?.address || "Not provided"}
                                />
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Available Slots</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.availableSlots?.length ? (
                                        profile.availableSlots.map((slot, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-medium">{slot.date}</p>
                                                <p className="text-gray-600">{slot.start} - {slot.end}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No slots available</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(handleSave, handleError)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        {...register("name")}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        {...register("email")}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        {...register("phone")}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        {...register("bio")}
                                        rows={4}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Education
                                    </label>
                                    <textarea
                                        {...register("education")}
                                        rows={3}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Experience
                                    </label>
                                    <textarea
                                        {...register("experience")}
                                        rows={3}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Specialties
                                </label>
                                <div className="space-y-2">
                                    {specialtyFields.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-2">
                                            <input
                                                {...register(`specialties.${index}`)}
                                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSpecialty(index)}
                                                className="p-2 text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => appendSpecialty("")}
                                        className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        Add Specialty
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clinic Address
                                </label>
                                <input
                                    {...register("clinicLocation.address")}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    onBlur={(e) => handleAddressChange(e.target.value)}
                                />
                                {errors.clinicLocation?.address && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.clinicLocation.address.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Available Slots
                                </label>
                                <div className="text-sm text-gray-500 mt-2">
                                    <p>Time slot rules:</p>
                                    <ul className="list-disc list-inside">
                                        <li>End time must be after start time</li>
                                        <li>Slots cannot overlap on the same day</li>
                                        <li>Each slot must have a unique time range</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    {slotFields.map((item, index) => (
                                        <div key={item.id} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-md">
                                            <input
                                                type="date"
                                                {...register(`availableSlots.${index}.date`)}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <input
                                                type="time"
                                                {...register(`availableSlots.${index}.start`)}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <input
                                                type="time"
                                                {...register(`availableSlots.${index}.end`)}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(index)}
                                                className="p-2 text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => appendSlot({ date: "", start: "", end: "" })}
                                        className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        Add Time Slot
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function ProfileRow({ label, value }) {
    return (
        <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="font-medium text-gray-900">{value}</p>
        </div>
    );
}