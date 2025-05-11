const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const sendEmail = require('../utils/mailSender');
const agenda = require('../config/agenda');

// POST /api/bookings - Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { doctorId, patientId, familyMemberId, familyMemberName, appointmentTime, specialty } = req.body;

        const doctor = await Doctor.findById(doctorId).populate('userId');
        const patient = await Patient.findById(patientId).populate('userId');

        if (!doctor || !patient) {
            return res.status(404).json({
                success: false,
                message: "Doctor or Patient not found."
            });
        }

        const newBooking = new Booking({
            doctorId,
            patientId,
            familyMemberId,
            familyMemberName,
            appointmentTime,
            specialty,
            status: 'scheduled'
        });

        await newBooking.save();

        // Prepare details for the reminder
        const userName = patient.userId.name;
        const doctorName = doctor.userId.name;
        const appointmentDate = appointmentTime;
        const clinicAddress = doctor.clinicLocation?.address || 'Clinic address not provided';

        const rideLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinicAddress)}`;

        // Schedule the appointment reminder email 1 hour before
        const reminderTime = new Date(new Date(appointmentTime).getTime() - 60 * 60 * 1000);

        agenda.schedule(reminderTime, 'send appointment reminder', {
            to: patient.userId.email,
            userName,
            doctorName,
            appointmentDate,
            clinicAddress,
            rideLink
        });

        return res.status(201).json({
            success: true,
            booking: newBooking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};


exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!['completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. It must be 'completed' or 'cancelled'."
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        booking.status = status;
        booking.updatedAt = Date.now();

        await booking.save();

        // Notify both doctor and patient
        const doctor = await Doctor.findById(booking.doctorId).populate('userId');
        const patient = await Patient.findById(booking.patientId).populate('userId');

        const emailSubject = status === 'completed'
            ? 'Your appointment is completed'
            : 'Your appointment has been cancelled';

        const emailBody = `
            <p>Hello ${patient.userId.name},</p>
            <p>Your appointment with Dr. ${doctor.userId.name} has been <strong>${status}</strong>.</p>
            <p><strong>Specialty:</strong> ${booking.specialty}</p>
            <p><strong>Date:</strong> ${new Date(booking.appointmentTime).toLocaleString()}</p>
            <p>Thank you for using our platform.</p>
        `;

        await sendEmail(patient.userId.email, emailSubject, emailBody);
        await sendEmail(doctor.userId.email, emailSubject, emailBody);

        return res.status(200).json({
            success: true,
            message: `Booking status updated to '${status}'.`,
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};