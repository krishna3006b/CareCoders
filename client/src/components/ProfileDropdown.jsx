import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/userSlice";

const ProfileDropdown = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <div className="min-w-[200px] max-w-[300px] w-full bg-white rounded-md border border-gray-200 shadow-md">
            <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 p-4 w-full hover:bg-gray-50"
            >
                <img
                    src={
                        user?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-800">{user?.name || "User"}</span>
            </button>

            <button
                onClick={handleLogout}
                className="w-full text-left p-4 border-t border-gray-200 text-sm text-red-600 hover:bg-red-50"
            >
                Logout
            </button>
        </div>
    );
};

export default ProfileDropdown;