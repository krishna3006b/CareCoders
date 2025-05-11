const Patient = require('../models/Patient');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Get patient by userId
exports.getPatientById = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        // Find the patient by userId
        const patient = await Patient.findOne({ userId: patientId })
            .populate('userId', 'name email')  // Populate userId with name and email only
            .exec();

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        // Return patient data in the desired format
        return res.status(200).json({
            success: true,
            patient: {
                id: patient.userId._id,
                name: patient.userId.name,
                email: patient.userId.email,
                phone: patient.phone,
                location: patient.location,
                insuranceProvider: patient.insuranceProvider,
                policyNumber: patient.policyNumber,
                familyMembers: patient.familyMembers.map(fm => ({
                    id: fm._id,
                    name: fm.name,
                    relationship: fm.relationship,
                    dateOfBirth: fm.dateOfBirth
                }))
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

// GET Bookings for a Patient
exports.getBookingsForPatient = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        const bookings = await Booking.find({ patientId })
            .populate('doctorId', 'name')
            .exec();

        return res.status(200).json({
            success: true,
            appointments: bookings.map(booking => ({
                id: booking._id,
                doctorName: booking.doctorId.name,
                familyMemberName: booking.familyMemberName,
                appointmentTime: booking.appointmentTime,
                specialty: booking.specialty,
                status: booking.status
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

// Update patient profile
exports.updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const { name, email, phone, location, insuranceProvider, policyNumber, familyMembers } = req.body;

        // Find patient by ID
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Update patient details
        patient.name = name || patient.name;
        patient.email = email || patient.email;
        patient.phone = phone || patient.phone;
        patient.location = location || patient.location;
        patient.insuranceProvider = insuranceProvider || patient.insuranceProvider;
        patient.policyNumber = policyNumber || patient.policyNumber;
        patient.familyMembers = familyMembers || patient.familyMembers;

        patient.updatedAt = Date.now();

        await patient.save();
        res.status(200).json({ message: 'Patient updated successfully', patient });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};