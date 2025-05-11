import { NavLink, useLocation, matchPath } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaUser } from 'react-icons/fa';
import { TiHome } from "react-icons/ti";

export default function Footer() {

    const location = useLocation();

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
            <NavLink to="/" className={`flex flex-col items-center text-xs ${matchRoute('/') ? 'text-[#2563EB]' : 'text-gray-500'}`}>
                <TiHome className="text-xl" />
                Home
            </NavLink>
            <NavLink to="/appointments" className={`flex flex-col items-center text-xs ${matchRoute('/appointments') ? 'text-[#2563EB]' : 'text-gray-500'}`}>
                <FaCalendarAlt className="text-xl" />
                Appointments
            </NavLink>
            <NavLink to="/doctors" className={`flex flex-col items-center text-xs ${matchRoute('/doctors') ? 'text-[#2563EB]' : 'text-gray-500'}`}>
                <FaUserMd className="text-xl" />
                Doctors
            </NavLink>
            <NavLink to="/profile" className={`flex flex-col items-center text-xs ${matchRoute('/profile') ? 'text-[#2563EB]' : 'text-gray-500'}`}>
                <FaUser className="text-xl" />
                Profile
            </NavLink>
        </footer>
    );
}