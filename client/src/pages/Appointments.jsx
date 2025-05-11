import { FaCalendarAlt, FaClock, FaCalendarPlus } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { HiDocumentReport } from "react-icons/hi";
import { BsInfoCircleFill } from "react-icons/bs";
import Footer from "../components/Footer";
import { FaFilter } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Calendar from "../components/Calendar";

// Dummy appointment data
const upcomingAppointments = [
    {
        doctor: "Dr. Emily Johnson",
        specialty: "Cardiologist",
        date: "Mon, May 12",
        time: "10:30 AM",
        status: "Upcoming",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        doctor: "Dr. Michael Chen",
        specialty: "Dermatologist",
        date: "Thu, May 15",
        time: "2:00 PM",
        status: "Upcoming",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        doctor: "Dr. Jessica Martinez",
        specialty: "Neurologist",
        date: "Tue, May 20",
        time: "1:30 PM",
        status: "Upcoming",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
];

const pastAppointments = [
    {
        doctor: "Dr. Emily Johnson",
        specialty: "Cardiologist",
        date: "Mon, May 12",
        time: "10:30 AM",
        status: "Completed",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        doctor: "Dr. Michael Chen",
        specialty: "Dermatologist",
        date: "Thu, May 15",
        time: "2:00 PM",
        status: "Completed",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        doctor: "Dr. Jessica Martinez",
        specialty: "Neurologist",
        date: "Tue, May 20",
        time: "1:30 PM",
        status: "Completed",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
];

const FilterAppointments = ({ setStatus, onApply }) => {
    const handleReset = () => {
        setStatus("all");
    };

    return (
        <div className="bg-white flex flex-col gap-4 rounded-md p-4 shadow-xl border border-gray-100 w-full min-w-[220px] max-w-[400px]">
            <h3 className="text-base font-semibold text-gray-800">Filter Appointments</h3>

            <div className="text-sm">
                <p className="font-medium text-gray-700 mb-2">Status</p>
                <div className="flex flex-col gap-2 pl-1 text-gray-600">
                    <label className="flex items-center gap-2 text-xs">
                        <input
                            type="radio"
                            name="status"
                            value="all"
                            defaultChecked
                            onChange={() => setStatus("all")}
                        />
                        All
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                        <input
                            type="radio"
                            name="status"
                            value="upcoming"
                            onChange={() => setStatus("upcoming")}
                        />
                        Upcoming
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                        <input
                            type="radio"
                            name="status"
                            value="past"
                            onChange={() => setStatus("past")}
                        />
                        Past
                    </label>
                </div>
            </div>

            <div className="w-full flex items-center justify-between mt-2">
                <button
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-normal rounded-sm py-1 px-3"
                    onClick={handleReset}
                >
                    Reset
                </button>
                <button
                    className="text-xs bg-[#2563EB] hover:bg-blue-600 text-white font-normal rounded-sm py-1 px-3"
                    onClick={onApply}
                >
                    Apply
                </button>
            </div>
        </div>
    );
};

export default function Appointments() {
    const navigate = useNavigate();
    const [openFilter, setOpenFilter] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const filteredUpcoming = upcomingAppointments.filter((a) => {
        return filterStatus === "all" || filterStatus === "upcoming";
    });

    const filteredPast = pastAppointments.filter((a) => {
        return filterStatus === "all" || filterStatus === "past";
    });

    return (
        <div className="flex flex-col h-screen">
            <header className="relative bg-white flex gap-1 justify-between items-center p-4 text-lg font-semibold text-gray-900">
                <TiArrowLeft fontSize={26} className="cursor-pointer" onClick={() => navigate(-1)} />
                <p>Appointments</p>
                <FaFilter fontSize={18} fill="#101828" className="cursor-pointer" onClick={() => setOpenFilter((prev) => !prev)} />
                <div className="absolute top-10 right-5 z-10">
                    {openFilter && (
                        <FilterAppointments
                            setStatus={setFilterStatus}
                            onApply={() => setOpenFilter(false)}
                        />
                    )}
                </div>
            </header>

            <main className="flex flex-col gap-4 overflow-y-auto p-4 bg-gray-100 mb-12">
                <div className="w-full">
                    <Calendar />
                </div>

                <Link to='/book-appointment' className="bg-blue-600 text-white text-center rounded-md p-2 cursor-pointer">
                    Book New Appointment
                </Link>

                {(filterStatus === "all" || filterStatus === "upcoming") && (
                    <div className="w-full mx-auto">
                        <h1 className="text-2xl font-semibold mb-6 text-gray-700">Upcoming Appointments</h1>
                        <div className="flex flex-col gap-4">
                            {filteredUpcoming.map((appointment, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-4">
                                    <div className="w-full flex flex-row flex-wrap justify-between">
                                        <div className="flex flex-wrap gap-4 items-start sm:items-center">
                                            <img src={appointment.image} alt={appointment.doctor} className="w-12 h-12 rounded-full object-cover" />
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-semibold text-gray-800">{appointment.doctor}</h3>
                                                <p className="text-xs text-gray-500">{appointment.specialty}</p>
                                                <div className="flex flex-col gap-2 text-xs text-gray-600 mt-1">
                                                    <div className="flex gap-2 items-center">
                                                        <FaCalendarAlt className="text-blue-500" />
                                                        <span>{appointment.date}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <FaClock className="text-blue-500" />
                                                        <span>{appointment.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 h-fit w-fit text-blue-700">
                                            {appointment.status}
                                        </span>
                                    </div>

                                    <div className="w-full flex flex-wrap gap-2 justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                                        <button onClick={() => console.log("Reschedule", appointment)} className="flex items-center gap-1">
                                            <FaCalendarAlt /> Reschedule
                                        </button>
                                        <button onClick={() => setSelectedAppointment(appointment)} className="flex items-center gap-1 text-blue-600">
                                            <BsInfoCircleFill /> Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(filterStatus === "all" || filterStatus === "past") && (
                    <div className="w-full mx-auto">
                        <h1 className="text-2xl font-semibold mb-6 text-gray-700">Past Appointments</h1>
                        <div className="flex flex-col gap-4">
                            {filteredPast.map((appointment, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-4">
                                    <div className="w-full flex flex-row flex-wrap justify-between">
                                        <div className="flex flex-wrap gap-4 items-start sm:items-center">
                                            <img src={appointment.image} alt={appointment.doctor} className="w-12 h-12 rounded-full object-cover" />
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-semibold text-gray-800">{appointment.doctor}</h3>
                                                <p className="text-xs text-gray-500">{appointment.specialty}</p>
                                                <div className="flex flex-col gap-2 text-xs text-gray-600 mt-1">
                                                    <div className="flex gap-2 items-center">
                                                        <FaCalendarAlt className="text-blue-500" />
                                                        <span>{appointment.date}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <FaClock className="text-blue-500" />
                                                        <span>{appointment.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700 h-fit w-fit">
                                            {appointment.status}
                                        </span>
                                    </div>

                                    <div className="w-full flex flex-wrap gap-2 justify-between text-xs text-gray-600 border-t border-gray-200 pt-2">
                                        <button onClick={() => console.log("Book Again", appointment)} className="flex items-center gap-1 text-blue-600">
                                            <FaCalendarPlus /> Book Again
                                        </button>
                                        <button onClick={() => setSelectedAppointment(appointment)} className="flex items-center gap-1 text-blue-600">
                                            <BsInfoCircleFill /> Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal for Details */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={() => setSelectedAppointment(null)}
                        >
                            ✕
                        </button>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <img src={selectedAppointment.image} alt="doctor" className="w-14 h-14 rounded-full" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{selectedAppointment.doctor}</h2>
                                    <p className="text-sm text-gray-500">{selectedAppointment.specialty}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                <p><strong>Date:</strong> {selectedAppointment.date}</p>
                                <p><strong>Time:</strong> {selectedAppointment.time}</p>
                                <p><strong>Status:</strong> {selectedAppointment.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}