const Doctor = require('../models/Doctor');
const User = require('../models/User');

// GET Today's Appointments for a Doctor
exports.getTodayAppointments = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        const appointments = await Appointment.find({
            doctorId,
            appointmentTime: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) }
        }).populate('patientId').exec();

        return res.status(200).json({
            success: true,
            appointments: appointments.map(appointment => ({
                id: appointment._id,
                patientName: appointment.patientId.name,
                familyMemberName: appointment.familyMemberName,
                appointmentTime: appointment.appointmentTime,
                specialty: appointment.specialty,
                status: appointment.status
            }))
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};

// Get Doctor Profile by UserId
exports.getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.userId }).populate('userId', 'name email').exec();

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        return res.status(200).json({
            success: true,
            doctor: {
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                bio: doctor.bio,
                education: doctor.education,
                experience: doctor.experience,
                specialties: doctor.specialties,
                clinicLocation: doctor.clinicLocation,
                availableSlots: doctor.availableSlots,
                rating: doctor.rating,
                reviewCount: doctor.reviewCount
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};

// Update Doctor Profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.params.userId },
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor profile updated successfully.",
            doctor: {
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                bio: doctor.bio,
                education: doctor.education,
                experience: doctor.experience,
                specialties: doctor.specialties,
                clinicLocation: doctor.clinicLocation,
                availableSlots: doctor.availableSlots,
                rating: doctor.rating,
                reviewCount: doctor.reviewCount
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};