import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import profileReducer from "../slices/profileSlice";
import doctorsReducer from '../slices/doctorsSlice';
import bookingReducer from '../slices/bookingSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        profile: profileReducer,
        doctors: doctorsReducer,
        booking: bookingReducer,
    },
});