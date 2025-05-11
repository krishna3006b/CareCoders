import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    doctors: [],
    locations: [],
    specialties: [],
    loading: false,
    error: null
};

const doctorsSlice = createSlice({
    name: 'doctors',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setDoctors: (state, action) => {
            state.doctors = action.payload;
            state.locations = [...new Set(action.payload.map(d => d.clinicLocation?.address).filter(Boolean))];
            state.loading = false;
            state.error = null;
        },
        setSpecialties: (state, action) => {
            state.specialties = action.payload;
        }
    }
});

export const { setLoading, setError, setDoctors, setSpecialties } = doctorsSlice.actions;
export default doctorsSlice.reducer;