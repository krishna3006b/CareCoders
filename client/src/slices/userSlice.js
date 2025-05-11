import { createSlice } from "@reduxjs/toolkit";

// Retrieve user and token from localStorage if available
const initialAuth = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : { user: null, token: null, profile: null };

const initialState = {
    user: initialAuth.user,
    token: initialAuth.token,
    profile: initialAuth.profile,
    isAuthenticated: Boolean(initialAuth.token),
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // Action to handle successful login
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.profile = action.payload.profile;
            state.isAuthenticated = true;
            localStorage.setItem("auth", JSON.stringify(action.payload));
        },

        // Action to handle logout
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.profile = null;
            state.isAuthenticated = false;
            localStorage.removeItem("auth");
        },

        // Load user data from localStorage on app startup
        loadUserFromStorage: (state) => {
            const storedAuth = localStorage.getItem("auth");
            if (storedAuth) {
                const parsedAuth = JSON.parse(storedAuth);
                state.user = parsedAuth.user;
                state.token = parsedAuth.token;
                state.profile = parsedAuth.profile;
                state.isAuthenticated = Boolean(parsedAuth.token);
            } else {
                state.user = null;
                state.token = null;
                state.profile = null;
                state.isAuthenticated = false;
            }
        },

        // Optional: Update profile info separately (e.g. after editing)
        updateProfile: (state, action) => {
            state.profile = { ...state.profile, ...action.payload };
            const updatedAuth = {
                user: state.user,
                token: state.token,
                profile: state.profile
            };
            localStorage.setItem("auth", JSON.stringify(updatedAuth));
        }
    },
});

export const { loginSuccess, logout, loadUserFromStorage, updateProfile } = userSlice.actions;
export default userSlice.reducer;