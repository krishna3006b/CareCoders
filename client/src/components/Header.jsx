import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown';
import Logo from '../assets/logo.png';

export default function Header() {

    const [showDropdown, setShowDropDown] = useState();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="p-1 rounded-full bg-gray-100 inline-block">
                    <img src={Logo} alt="" className="w-9 h-9 object-cover rounded-full" />
                </span>
                <h1 className="text-lg font-semibold text-gray-800">DocSure</h1>
            </div>

            <div className="relative flex items-center gap-4">
                {/* Optional: add links like Home, Profile, etc. */}
                <span
                    className='cursor-pointer p-2 bg-gray-200 rounded-md'
                    onClick={() => setShowDropDown((prev) => !prev)}
                >
                    <FaUser className="text-xl text-gray-600" />
                </span>
                {
                    showDropdown && <div className='absolute top-10 right-1 z-10'>
                        <ProfileDropdown />
                    </div>
                }
            </div>
        </header>
    );
}