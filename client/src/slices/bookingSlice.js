import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bookings: [],
    loading: false,
    error: null,
    currentBooking: null
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setBookings: (state, action) => {
            state.bookings = action.payload;
            state.loading = false;
        },
        addBooking: (state, action) => {
            state.bookings.push(action.payload);
            state.currentBooking = action.payload;
        },
        updateBooking: (state, action) => {
            state.bookings = state.bookings.map(booking =>
                booking._id === action.payload._id ? action.payload : booking
            );
        }
    }
});

export const {
    setLoading,
    setError,
    setBookings,
    addBooking,
    updateBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;