import DoctorProfile from "../components/DoctorProfile";
import PatientProfile from "../components/PatientProfile";

export default function Profile({ role }) {

    return (
        <div>
            {role === "doctor" ? <DoctorProfile /> : <PatientProfile />}
        </div>
    );
}