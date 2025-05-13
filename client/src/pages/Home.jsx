import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FaCalendarCheck } from 'react-icons/fa';
import { FaLightbulb } from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { motion } from "framer-motion";
import MaleImg from '../assets/Male.jpg'
import FemaleImg from '../assets/Female.png'
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { toast } from "react-hot-toast";

export default function Home() {
    const [gender, setGender] = useState('Male');
    const { user, token } = useSelector(state => state.user);
    const backendUrl = import.meta.env.VITE_API_URL;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const healthTips = [
        {
            title: "Stay Hydrated",
            description: "Remember to drink at least 8 glasses of water daily for optimal health.",
        },
        {
            title: "Regular Exercise",
            description: "Engage in at least 30 minutes of moderate physical activity every day.",
        },
        {
            title: "Balanced Diet",
            description: "Incorporate a variety of fruits, vegetables, lean proteins, and whole grains in your meals.",
        },
        {
            title: "Adequate Sleep",
            description: "Aim for 7-9 hours of quality sleep each night to support overall health.",
        },
        {
            title: "Stress Management",
            description: "Practice mindfulness, deep breathing, or meditation to reduce stress levels.",
        },
    ];

    const people = [
        {
            id: 1,
            name: "John Smith",
            age: '35',
            group: "Adult",
            image: "https://randomuser.me/api/portraits/men/45.jpg",
        },
        {
            id: 2,
            name: "Emma Johnson",
            age: '72',
            group: "Elderly",
            image: "https://randomuser.me/api/portraits/women/65.jpg",
        },
        {
            id: 3,
            name: "Max",
            age: '',
            group: "Pet",
            image: "https://randomuser.me/api/portraits/men/68.jpg",
        }
    ];

    const [specialties, setSpecialties] = useState(user.specialties);
    const [availability, setAvailability] = useState(user.availability);
    const [clinic, setClinic] = useState(user.clinic);

    const handleSubmit = () => {
        const payload = {
            specialties,
            availability,
            clinic,
        };
        console.log('Form Submitted:', payload);
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                if (!user?.id || !token) {
                    setLoading(false);
                    return;
                }
                const response = await apiConnector(
                    "GET",
                    `${backendUrl}/patients/bookings/${user.id}`,
                    null,
                    {
                        Authorization: `Bearer ${token}`
                    }
                );
                if (!response.data.success) {
                    throw new Error(response.data.message);
                }
                setAppointments(response.data.appointments);
            } catch (error) {
                toast.error(error.message || "Failed to fetch appointments");
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user, token, backendUrl]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };
    const currentDate = new Date();
    const upcomingAppointments = appointments.filter(appointment => 
        new Date(appointment.appointmentTime) >= currentDate
    );
    const recentAppointments = upcomingAppointments.slice(0, 3);

    return (
        <div className="flex flex-col h-screen">
            <Header />

            <main className="flex-1 overflow-y-auto p-4 bg-gray-100 mb-12">
                <div className="w-full mx-auto">
                    <div className="bg-white rounded-md p-5 text-gray-700">
                        <div className="flex flex-col gap-1 items-start">
                            <h2 className="text-gray-800 text-3xl font-semibold">Welcome to DocSure</h2>
                            <p className="text-base">Who needs medical attention today?</p>
                        </div>

                        <div className="flex flex-col items-center justify-center mt-6">
                            <div className="relative w-[160px] p-1 border border-gray-400 rounded-md bg-white flex justify-between mb-4">
                                <motion.div
                                    layout
                                    initial={false}
                                    animate={{
                                        x: gender === "Male" ? 0 : "100%",
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-600 rounded-md z-0"
                                />
                                <div className="relative z-10 flex w-full justify-between text-sm font-medium text-gray-700">
                                    <button
                                        className={`w-1/2 py-2 cursor-pointer rounded-md ${gender === "Male" ? "text-white" : ""}`}
                                        onClick={() => setGender("Male")}
                                    >
                                        Male
                                    </button>
                                    <button
                                        className={`w-1/2 py-2 cursor-pointer rounded-md ${gender === "Female" ? "text-white" : ""}`}
                                        onClick={() => setGender("Female")}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>

                            <img src={gender === "Male" ? MaleImg : FemaleImg} alt={gender} className="max-w-[500px] w-full rounded-md object-contain" />
                        </div>

                        <div className="w-9/12 mx-auto flex flex-row flex-wrap gap-1 justify-between p-4">
                            {people?.map((person) => (
                                <div key={person.id} className='flex flex-col gap-0.5 text-center items-center'>

                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-gray-100 mt-4"
                                    />

                                    <h3 className="font-semibold text-gray-800 text-sm text-center">{person.name}{person.age && ', ' + person.age}</h3>
                                    <p className="text-xs text-gray-600 text-center">
                                        {person.group}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="my-4 bg-white rounded-md p-5 text-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                        <div className='flex flex-col gap-4'>
                            {recentAppointments.length === 0 ? (
                                <p className="text-gray-500 text-center">No upcoming appointments</p>
                            ) : (
                                recentAppointments.map((appointment) => (
                                    <div key={appointment._id} className="bg-white flex justify-between items-center border border-gray-200 rounded-md p-4">
                                        <div className='flex gap-4 items-center'>
                                            <div className={`p-2 rounded-full ${appointment.status === 'scheduled' ? 'bg-[#DBEAFE]' : 'bg-[#F3F4F8]'}`}> 
                                                <FaCalendarCheck fill={`${appointment.status === 'scheduled' ? '#2563EB' : '#6a7282'}`} />
                                            </div>
                                            <div className='flex flex-col gap-0.5'>
                                                <h3 className="font-bold text-[14px]">{appointment.doctorId?.name || 'Doctor'}</h3>
                                                <p className="text-gray-600 text-xs">{appointment.specialty} • {formatDate(appointment.appointmentTime)}, {formatTime(appointment.appointmentTime)}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${appointment.status === 'scheduled'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        )}
                        <div className="mt-4 flex flex-row items-center text-base font-medium text-blue-700">
                            <Link to='/appointments'>View all appointments</Link>
                            <MdOutlineKeyboardArrowRight fontSize={18} />
                        </div>
                    </div>

                    <div className="bg-white rounded-md p-5 text-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Health Tips</h2>

                        <div className='flex flex-col gap-4'>
                            {healthTips.map((tip, index) => (
                                <div key={index} className="bg-blue-50 flex gap-3 border border-gray-200 rounded-md p-4">
                                    <FaLightbulb className="text-[#2563EB] mt-2" />
                                    <div className='flex flex-col gap-0.5'>
                                        <h3 className="font-bold text-[14px]">{tip.title}</h3>
                                        <p className="text-gray-600 text-sm">{tip.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}