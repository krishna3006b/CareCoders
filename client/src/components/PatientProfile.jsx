import { useState, useEffect } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";

export default function PatientProfile() {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [newMember, setNewMember] = useState("");

    const dummyPatient = {
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        location: "123 Main St",
        insuranceProvider: "Blue Cross",
        policyNumber: "BC123456",
        familyMembers: ["Spouse", "Child 1"]
    };

    useEffect(() => {
        setFormData(dummyPatient);
        setOriginalData(dummyPatient);
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log("Patient Details Saved:", formData);
        toast.success("Details saved successfully!");

        setEditing(false);
        setOriginalData(formData);
        toast.success("Saved successfully!");
    };

    const handleCancel = () => {
        setFormData(originalData);
        setEditing(false);
    };

    const handleAddFamily = () => {
        const trimmed = newMember.trim();
        if (!trimmed || formData.familyMembers.includes(trimmed)) return;
        setFormData(prev => ({
            ...prev,
            familyMembers: [...prev.familyMembers, trimmed]
        }));
        setNewMember("");
    };

    const handleRemoveMember = (index) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: prev.familyMembers.filter((_, i) => i !== index)
        }));
    };

    if (!formData) return <div>Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow p-6 bg-white mt-16 mb-16 overflow-y-auto">
                <div className="max-w-4xl mx-auto mt-6">
                    <h2 className="text-xl font-bold mb-4">Patient Profile</h2>

                    {!editing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <ProfileRow label="Name" value={formData.name} />
                            <ProfileRow label="Email" value={formData.email} />
                            <ProfileRow label="Phone" value={formData.phone} />
                            <ProfileRow label="Location" value={formData.location} />
                            <ProfileRow label="Insurance Provider" value={formData.insuranceProvider} />
                            <ProfileRow label="Policy Number" value={formData.policyNumber} />
                            <div className="col-span-2">
                                <p className="text-gray-500">Family Members</p>
                                <ul className="list-disc pl-5 text-gray-800">
                                    {formData.familyMembers.length > 0 ? formData.familyMembers.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    )) : <li className="italic text-gray-400">None</li>}
                                </ul>
                            </div>
                            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded col-span-2" onClick={() => setEditing(true)}>
                                Edit
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["name", "email", "phone", "location", "insuranceProvider", "policyNumber"].map((field) => (
                                <div key={field}>
                                    <label className="block text-gray-600 capitalize mb-1">{field.replace(/([A-Z])/g, " $1")}</label>
                                    <input
                                        className="w-full border px-3 py-2 rounded"
                                        value={formData[field] || ""}
                                        onChange={(e) => handleInputChange(field, e.target.value)}
                                    />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="block text-gray-600 mb-1">Family Members</label>
                                <ul className="space-y-2">
                                    {formData.familyMembers.map((member, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
                                            <span>{member}</span>
                                            <button
                                                onClick={() => handleRemoveMember(index)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Remove"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 flex gap-2">
                                    <input
                                        value={newMember}
                                        onChange={(e) => setNewMember(e.target.value)}
                                        className="flex-1 border px-3 py-2 rounded"
                                        placeholder="Add new member"
                                    />
                                    <button
                                        onClick={handleAddFamily}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        title="Add"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <button onClick={handleCancel} className="px-4 py-2 bg-gray-400 text-white rounded">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
                                    Save
                                </button>
                            </div>
                        </div>
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
            <p className="font-medium">{value || "—"}</p>
        </div>
    );
}

// Include ToastContainer to render toast messages
export const App = () => {
    return (
        <>
            <PatientProfile />
            <ToastContainer />
        </>
    );
};