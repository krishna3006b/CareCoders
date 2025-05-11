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
}

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'name email phone');

        const formattedDoctors = doctors.map(doctor => ({
            _id: doctor._id,
            name: doctor.userId.name,
            email: doctor.userId.email,
            phone: doctor.userId.phone,
            bio: doctor.bio,
            education: doctor.education,
            experience: doctor.experience,
            specialties: doctor.specialties,
            clinicLocation: doctor.clinicLocation,
            availableSlots: doctor.availableSlots,
            rating: doctor.rating,
            reviewCount: doctor.reviewCount
        }));

        res.status(200).json({
            success: true,
            doctors: formattedDoctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching doctors",
            error: error.message
        });
    }
}

// Get Doctor Profile
exports.getDoctorProfile = async (req, res) => {
    try {
        console.log("djkghduig");
        const doctor = await Doctor.findOne({ userId: req.params.userId })
            .populate('userId', 'name email phone');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        console.log("kdjgug");

        const profileData = {
            userId: doctor.userId._id,
            name: doctor.userId.name,
            email: doctor.userId.email,
            phone: doctor.userId.phone,
            bio: doctor.bio || "",
            education: doctor.education || "",
            experience: doctor.experience || "",
            specialties: doctor.specialties || [],
            clinicLocation: doctor.clinicLocation || {},
            availableSlots: doctor.availableSlots || [],
            rating: doctor.rating || 0,
            reviewCount: doctor.reviewCount || 0
        };

        return res.status(200).json({
            success: true,
            doctor: profileData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};

// Update Doctor Profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        const { name, email, phone, ...doctorData } = req.body;

        await User.findByIdAndUpdate(req.params.userId, {
            name,
            email,
            phone
        });

        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.params.userId },
            {
                ...doctorData,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        const updatedProfile = {
            userId: doctor.userId._id,
            name: doctor.userId.name,
            email: doctor.userId.email,
            phone: doctor.userId.phone,
            bio: doctor.bio,
            education: doctor.education,
            experience: doctor.experience,
            specialties: doctor.specialties,
            clinicLocation: doctor.clinicLocation,
            availableSlots: doctor.availableSlots,
            rating: doctor.rating,
            reviewCount: doctor.reviewCount
        };

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            doctor: updatedProfile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating profile"
        });
    }
};