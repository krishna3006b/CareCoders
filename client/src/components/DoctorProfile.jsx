import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Footer from "./Footer";
import Header from "./Header";
import toast from "react-hot-toast";

// Time slot overlap checker
const timeOverlap = (slot1, slot2) => {
    const time1Start = new Date(`${slot1.date}T${slot1.start}`);
    const time1End = new Date(`${slot1.date}T${slot1.end}`);
    const time2Start = new Date(`${slot2.date}T${slot2.start}`);
    const time2End = new Date(`${slot2.date}T${slot2.end}`);
    return time1Start < time2End && time1End > time2Start;
};

export default function DoctorProfile() {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState(null);

    const dummyDoctor = {
        name: "Dr. Sarah Smith",
        email: "dr.sarah@example.com",
        phone: "987-654-3210",
        bio: "Experienced cardiologist.",
        education: "Harvard Medical School",
        experience: "10 years at City Hospital",
        specialties: ["Cardiology", "Pediatrics"],
        clinicLocation: {
            address: "456 Health Blvd, Medical City",
            lat: null,
            lng: null,
        },
        availableSlots: [
            { date: "2025-05-12", start: "09:00", end: "10:00" },
            { date: "2025-05-13", start: "11:00", end: "12:00" },
        ],
        rating: 4.5,
        reviewCount: 22,
    };

    useEffect(() => {
        setFormData(dummyDoctor);
    }, []);

    const handleError = (errors) => {
        if (errors.availableSlots?.message === "Time slots are overlapping") {
            toast.error("Time slots are overlapping!");
        } else {
            toast.error("Please fix form errors before submitting.");
        }
    };

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
        availableSlots: z.array(slotSchema).refine((slots) => {
            for (let i = 0; i < slots.length; i++) {
                for (let j = i + 1; j < slots.length; j++) {
                    if (slots[i].date === slots[j].date && timeOverlap(slots[i], slots[j])) {
                        return false;
                    }
                }
            }
            return true;
        }, "Time slots are overlapping"),
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
        defaultValues: dummyDoctor,
    });

    const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
        control,
        name: "specialties",
    });

    const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
        control,
        name: "availableSlots",
    });

    useEffect(() => {
        if (formData) reset(formData);
    }, [formData, reset]);

    const handleSave = (data) => {
        setEditing(false);
        setFormData(data);
        console.log("Saved Data:", data);
        toast.success("Saved successfully!");
    };

    const handleAddressChange = async (address) => {
        setValue("clinicLocation.address", address);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data[0]) {
                setValue("clinicLocation.lat", parseFloat(data[0].lat));
                setValue("clinicLocation.lng", parseFloat(data[0].lon));
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
        }
    };

    if (!formData) return <div>Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow p-6 bg-white mb-16">
                <div className="max-w-4xl mx-auto mt-6">
                    <h2 className="text-xl font-bold mb-4">Doctor Profile</h2>
                    {!editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ProfileRow label="Name" value={formData.name} />
                            <ProfileRow label="Email" value={formData.email} />
                            <ProfileRow label="Phone" value={formData.phone} />
                            <ProfileRow label="Bio" value={formData.bio} />
                            <ProfileRow label="Education" value={formData.education} />
                            <ProfileRow label="Experience" value={formData.experience} />
                            <ProfileRow label="Specialties" value={formData.specialties.join(", ")} />
                            <ProfileRow label="Clinic Address" value={formData.clinicLocation.address} />
                            <ProfileRow label="Available Slots" value={formData.availableSlots.map(s => `${s.date}: ${s.start} - ${s.end}`).join(" | ")} />
                            <ProfileRow label="Rating" value={formData.rating} />
                            <ProfileRow label="Review Count" value={formData.reviewCount} />
                            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded col-span-2" onClick={() => setEditing(true)}>Edit</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(handleSave, handleError)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-gray-600">Name</label>
                                <input
                                    {...register("name")}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-600">Email</label>
                                <input {...register("email")} className="w-full border px-3 py-2 rounded bg-gray-100" disabled readOnly />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-600">Phone</label>
                                <input {...register("phone")} className="w-full border px-3 py-2 rounded" />
                                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 text-gray-600">Bio</label>
                                <textarea {...register("bio")} className="w-full border px-3 py-2 rounded" rows={3} />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-600">Education</label>
                                <input {...register("education")} className="w-full border px-3 py-2 rounded" />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-600">Experience</label>
                                <input {...register("experience")} className="w-full border px-3 py-2 rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 text-gray-600">Clinic Address</label>
                                <input
                                    {...register("clinicLocation.address")}
                                    className="w-full border px-3 py-2 rounded"
                                    onBlur={(e) => handleAddressChange(e.target.value)}
                                />
                                {errors.clinicLocation?.address && (
                                    <p className="text-red-500 text-sm">{errors.clinicLocation.address.message}</p>
                                )}
                            </div>
                            {/* Specialties */}
                            <div className="col-span-2">
                                <label className="block text-gray-600 mb-1">Specialties</label>
                                {specialtyFields.map((item, index) => (
                                    <div key={item.id} className="flex flex-wrap gap-2 mb-2">
                                        <Controller
                                            control={control}
                                            name={`specialties.${index}`}
                                            render={({ field }) => (
                                                <input {...field} placeholder="Specialty" className="w-1/2 border px-3 py-2 rounded" />
                                            )}
                                        />
                                        <button type="button" onClick={() => removeSpecialty(index)} className="text-red-500">Delete</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => appendSpecialty("")} className="text-blue-600 text-sm">+ Add Specialty</button>
                            </div>
                            {/* Available Slots */}
                            <div className="col-span-2">
                                <label className="block text-gray-600 mb-1">Available Slots</label>
                                {slotFields.map((item, index) => (
                                    <div key={item.id} className="flex flex-wrap gap-2 mb-2">
                                        <Controller
                                            control={control}
                                            name={`availableSlots.${index}.date`}
                                            render={({ field }) => (
                                                <input {...field} type="date" className="w-1/3 border px-3 py-2 rounded" />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name={`availableSlots.${index}.start`}
                                            render={({ field }) => (
                                                <input {...field} type="time" className="w-1/3 border px-3 py-2 rounded" />
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name={`availableSlots.${index}.end`}
                                            render={({ field }) => (
                                                <input {...field} type="time" className="w-1/3 border px-3 py-2 rounded" />
                                            )}
                                        />
                                        <button type="button" onClick={() => removeSlot(index)} className="text-red-500">Delete</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => appendSlot({ date: "", start: "", end: "" })} className="text-blue-600 text-sm">+ Add Slot</button>
                                {errors.availableSlots?.message && <div className="text-red-500 text-sm">{errors.availableSlots.message}</div>}
                            </div>
                            {/* Buttons */}
                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setEditing(false)} className="bg-gray-400 px-4 py-2 text-white rounded">Cancel</button>
                                <button type="submit" className="bg-green-600 px-4 py-2 text-white rounded">Save</button>
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
        <div>
            <p className="text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}