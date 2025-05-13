import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage } from './slices/userSlice';

import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Profile from './pages/Profile';
import Doctors from './pages/Doctors';

function App() {
    const dispatch = useDispatch();
    const { token, user, isAuthenticated } = useSelector((state) => state.user);
    const role = user?.role;

    useEffect(() => {
        dispatch(loadUserFromStorage());
    }, [dispatch]);

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/profile' element={<Profile role={role} />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/appointments' element={<Appointments />} />
            <Route path='/book-appointment' element={<BookAppointment />} />
        </Routes>
    );
}

export default App;