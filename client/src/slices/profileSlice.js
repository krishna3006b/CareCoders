import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profileData: null,
    loading: false,
    error: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfileData: (state, action) => {
            state.profileData = action.payload;
        },
        updateProfileData: (state, action) => {
            state.profileData = { ...state.profileData, ...action.payload };
        },
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