import { createSlice } from "@reduxjs/toolkit";

// Initial state for the profile (patient or doctor)
const initialState = {
    profileData: null,
    loading: false,
    error: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        // Set full profile data (doctor or patient)
        setProfileData: (state, action) => {
            state.profileData = action.payload;
        },
        // Update profile fields (merged into existing)
        updateProfileData: (state, action) => {
            state.profileData = { ...state.profileData, ...action.payload };
        },
        // Specific to patient: update family members
        updateFamilyMembers: (state, action) => {
            if (state.profileData) {
                state.profileData.familyMembers = action.payload;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        // Optional reset (e.g., on logout)
        resetProfile: (state) => {
            state.profileData = null;
            state.loading = false;
            state.error = null;
        }
    },
});

export const {
    setProfileData,
    updateProfileData,
    updateFamilyMembers,
    setLoading,
    setError,
    resetProfile
} = profileSlice.actions;

export default profileSlice.reducer;