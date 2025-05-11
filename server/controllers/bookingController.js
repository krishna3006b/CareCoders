const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const sendEmail = require('../utils/mailSender');
const agenda = require('../config/agenda');

exports.createBooking = async (req, res) => {
    try {
        const { doctorId, patientId, familyMemberName, appointmentTime, specialty, slotInfo } = req.body;

        // Check if the slot is still available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Find the patient using patientId directly
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Convert appointment time to Date object for comparison
        const requestedAppointmentTime = new Date(appointmentTime);
        
        // Find the exact slot with more flexible comparison
        const slotToBook = doctor.availableSlots.find(slot => {
            const slotDate = new Date(`${slot.date}T${slot.start}`);
            // Compare only the date and time components, ignoring timezone
            return slotDate.getFullYear() === requestedAppointmentTime.getFullYear() &&
                   slotDate.getMonth() === requestedAppointmentTime.getMonth() &&
                   slotDate.getDate() === requestedAppointmentTime.getDate() &&
                   slotDate.getHours() === requestedAppointmentTime.getHours() &&
                   slotDate.getMinutes() === requestedAppointmentTime.getMinutes();
        });

        if (!slotToBook) {
            return res.status(400).json({
                success: false,
                message: "Selected time slot is not available"
            });
        }

        // Create booking with patient._id instead of userId
        const booking = new Booking({
            doctorId,
            patientId: patient._id,
            familyMemberName,
            appointmentTime: requestedAppointmentTime,
            specialty,
            status: 'scheduled'
        });

        await booking.save();

        // Remove the booked slot from available slots
        doctor.availableSlots = doctor.availableSlots.filter(slot => {
            const slotDate = new Date(`${slot.date}T${slot.start}`);
            // Compare only the date and time components, ignoring timezone
            return !(slotDate.getFullYear() === requestedAppointmentTime.getFullYear() &&
                    slotDate.getMonth() === requestedAppointmentTime.getMonth() &&
                    slotDate.getDate() === requestedAppointmentTime.getDate() &&
                    slotDate.getHours() === requestedAppointmentTime.getHours() &&
                    slotDate.getMinutes() === requestedAppointmentTime.getMinutes());
        });

        // Add to booked slots
        doctor.bookedSlots = doctor.bookedSlots || [];
        doctor.bookedSlots.push({
            date: slotInfo.date,
            start: slotInfo.start,
            end: slotInfo.end,
            bookingId: booking._id,
            patientId: patient._id,
            patientName: familyMemberName,
            status: 'scheduled'
        });

        await doctor.save();

        // Update patient's appointments
        patient.appointments = patient.appointments || [];
        patient.appointments.push(booking._id);
        await patient.save();

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: {
                booking
            }
        });
    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to book appointment",
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

exports.deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Find doctor and remove from bookedSlots
        const doctor = await Doctor.findById(booking.doctorId);
        if (doctor) {
            doctor.bookedSlots = doctor.bookedSlots.filter(
                slot => slot.bookingId.toString() !== bookingId
            );

            // Add the slot back to availableSlots
            doctor.availableSlots.push({
                date: new Date(booking.appointmentTime).toISOString().split('T')[0],
                start: new Date(booking.appointmentTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                end: new Date(new Date(booking.appointmentTime).getTime() + 60 * 60 * 1000)
                    .toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
            });

            await doctor.save();
        }

        // Find patient and remove from appointments
        const patient = await Patient.findOne({ userId: booking.patientId });
        if (patient) {
            patient.appointments = patient.appointments.filter(
                appointmentId => appointmentId.toString() !== bookingId
            );
            await patient.save();
        }

        // Delete the booking
        await Booking.findByIdAndDelete(bookingId);

        // Send notification emails
        const doctorWithUser = await Doctor.findById(booking.doctorId).populate('userId');
        const patientWithUser = await Patient.findById(booking.patientId).populate('userId');

        if (doctorWithUser?.userId?.email && patientWithUser?.userId?.email) {
            const emailSubject = 'Appointment Cancelled';
            const emailBody = `
                <h2>Appointment Cancelled</h2>
                <p>Dear ${booking.familyMemberName},</p>
                <p>Your appointment with Dr. ${doctorWithUser.userId.name} has been cancelled.</p>
                <p><strong>Date:</strong> ${new Date(booking.appointmentTime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(booking.appointmentTime).toLocaleTimeString()}</p>
                <p><strong>Specialty:</strong> ${booking.specialty}</p>
            `;

            await sendEmail(patientWithUser.userId.email, emailSubject, emailBody);
            await sendEmail(doctorWithUser.userId.email, emailSubject, emailBody);
        }

        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });

    } catch (error) {
        console.error('Delete booking error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete booking",
            error: error.message
        });
    }
};