import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfileDropdown = () => {
    const navigate = useNavigate();

    const user = {
        name: "John Doe",
        avatarUrl: "",
    };

    const handleLogout = () => {
        localStorage.removeItem("auth");
        navigate("/");
    };


    const goToProfile = () => {
        navigate("/profile");
    };

    return (
        <div className="min-w-[200px] max-w-[300px] w-full bg-white rounded-md border border-gray-200">
            <Link to={'/profile'}
                className="flex items-center gap-2 p-4 rounded cursor-pointer"
            >
                <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
            </Link>
            <button
                className="border-t border-gray-300 cursor-pointer p-4 w-full text-start"
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    );
};

export default ProfileDropdown;