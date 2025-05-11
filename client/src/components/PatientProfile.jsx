import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import Header from "./Header";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { setError, setLoading, setProfileData, updateProfileData } from "../slices/profileSlice";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema definition
const patientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    location: z.string().optional(),
    insuranceProvider: z.string().optional(),
    policyNumber: z.string().optional(),
    familyMembers: z.array(
        z.object({
            name: z.string().min(1, "Name is required"),
            relationship: z.string().min(1, "Relationship is required"),
            dateOfBirth: z.string().min(1, "Date of birth is required")
        })
    ).optional()
});

// Date formatting utilities
const formatDate = date => date ? new Date(date).toISOString().split('T')[0] : '';
const formatDisplayDate = date => date ? new Date(date).toLocaleDateString() : '';

export default function PatientProfile() {
    const [editing, setEditing] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { token } = useSelector(state => state?.user);
    const profile = useSelector((state) => state.profile.profileData);
    const loading = useSelector((state) => state.profile.loading);
    const error = useSelector((state) => state.profile.error);

    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(patientSchema),
        defaultValues: profile || {},
    });

    const { fields: familyFields, append: appendFamily, remove: removeFamily } = useFieldArray({
        control,
        name: "familyMembers",
    });

    const backendUrl = import.meta.env.VITE_API_URL;

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            if (!user?.id) {
                throw new Error("User not authenticated");
            }

            console.log("Fetching profile for user:", user.id); // Debug log

            const response = await apiConnector(
                "GET",
                `${backendUrl}/patients/${user.id}`,
                null,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            );

            console.log("API Response:", response);

            if (!response.data.success) {
                throw new Error(response.message || "Failed to fetch profile");
            }

            if (!response.data || !response.data.patient) {
                throw new Error("Invalid response format");
            }

            return response.data.patient;
        } catch (error) {
            console.error("Profile fetch error:", error); // Debug log
            throw new Error(error.message || "Failed to fetch profile");
        }
    };

    // Update handleSave function
    const handleSave = async (data) => {
        dispatch(setLoading(true));
        try {
            const formattedData = {
                ...data,
                familyMembers: data.familyMembers?.map(member => ({
                    ...member,
                    dateOfBirth: formatDate(member.dateOfBirth)
                })) || []
            };

            const response = await apiConnector(
                "PUT",
                `${backendUrl}/patients/update/${user.id}`,
                formattedData,
                {
                    'Authorization': `Bearer ${token}`
                }
            );

            if (!response.data.success) {
                throw new Error(response.message);
            }

            console.log("sdkjfbgbkgjrkjdsg: ", response);

            dispatch(updateProfileData(response.data.data.patient));
            toast.success("Profile updated successfully!");
            setEditing(false);
        } catch (err) {
            toast.error(err.message);
            dispatch(setError(err.message));
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (!user || !token) {
            toast.error("Please login to view profile");
            return;
        }

        const loadProfile = async () => {
            dispatch(setLoading(true));
            try {
                const data = await fetchProfile();
                if (!data) {
                    throw new Error("No profile data received");
                }
                dispatch(setProfileData(data));
                reset(data);
            } catch (err) {
                console.error("Profile loading error:", err); // Debug log
                dispatch(setError(err.message));
                toast.error(err.message);
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (!profile) {
            loadProfile();
        }
    }, [user, token, profile, dispatch, reset]);

    // Format dates when profile is loaded/updated
    useEffect(() => {
        if (!profile) return;
        const formattedProfile = {
            ...profile,
            familyMembers: profile.familyMembers?.map(member => ({
                ...member,
                dateOfBirth: formatDate(member.dateOfBirth)
            })) || []
        };
        reset(formattedProfile);
    }, [profile, reset]);

    if (!user) return <div>Please login to view profile</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>No profile found.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Profile</h2>
                    {!editing ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileRow label="Name" value={profile.name} />
                                <ProfileRow label="Email" value={profile.email} />
                                <ProfileRow label="Phone" value={profile.phone} />
                                <ProfileRow label="Location" value={profile.location || "Not provided"} />
                                <ProfileRow label="Insurance Provider" value={profile.insuranceProvider || "Not provided"} />
                                <ProfileRow label="Policy Number" value={profile.policyNumber || "Not provided"} />
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Family Members</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.familyMembers?.length ? (
                                        profile.familyMembers.map((member, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-gray-600">{member.relationship}</p>
                                                <p className="text-gray-600">
                                                    {formatDisplayDate(member.dateOfBirth)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No family members added</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                            {/* Basic Information */}
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
                                        type="email"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        {...register("location")}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Insurance Provider
                                    </label>
                                    <input
                                        {...register("insuranceProvider")}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Policy Number
                                    </label>
                                    <input
                                        {...register("policyNumber")}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Family Members */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Family Members
                                </label>
                                <div className="space-y-4">
                                    {familyFields?.map((field, index) => (
                                        <div key={field.id} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-md">
                                            <input
                                                {...register(`familyMembers.${index}.name`)}
                                                placeholder="Name"
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <input
                                                {...register(`familyMembers.${index}.relationship`)}
                                                placeholder="Relationship"
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <input
                                                type="date"
                                                {...register(`familyMembers.${index}.dateOfBirth`)}
                                                defaultValue={field.dateOfBirth ? formatDate(field.dateOfBirth) : ''}
                                                max={formatDate(new Date())} // Prevents future dates
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFamily(index)}
                                                className="p-2 text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => appendFamily({ name: "", relationship: "", dateOfBirth: formatDate(new Date()) })}
                                        className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        Add Family Member
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