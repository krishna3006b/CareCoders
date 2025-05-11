const mailSender = require('./mailSender');
const {
    generateAppointmentReminderTemplate
} = require('../mail/templets/generateAppointmentReminderTemplate');

const sendAppointmentReminder = async (userData, appointmentData) => {
    try {
        const { name: userName, email } = userData;
        const { doctorName, date, time, location, rideLink } = appointmentData;

        if (!email || !doctorName || !date || !time || !location || !rideLink) {
            throw new Error("Missing required appointment fields.");
        }

        const appointmentDate = new Date(`${date}T${time}`);

        const htmlTemplate = generateAppointmentReminderTemplate({
            userName,
            doctorName,
            appointmentDate,
            clinicAddress: location,
            rideLink
        });

        const emailTitle = `Appointment Reminder with ${doctorName}`;
        await mailSender(email, emailTitle, htmlTemplate);

        console.log(`Reminder email sent to ${email} for appointment on ${date} at ${time}`);
    } catch (error) {
        console.error("Error sending reminder email:", error.message);
    }
};

module.exports = sendAppointmentReminder;