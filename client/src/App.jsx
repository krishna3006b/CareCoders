import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import { Route, Routes } from 'react-router-dom';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Profile from './pages/Profile';
import Doctors from './pages/Doctors';

function App() {

    const auth = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth"))
        : null;

    const user = auth?.user || null;
    const role = user?.role || null;
    const token = auth?.token || null;

    if (!token) {
        return <AuthPage />;
    }

    return <>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/profile' element={<Profile role={role} />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/appointments' element={<Appointments />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
        </Routes>
    </>
}

export default App;