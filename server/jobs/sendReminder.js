const sendEmail = require('../utils/mailSender');
const { generateAppointmentReminderTemplate } = require('../mail/templets/generateAppointmentReminderTemplate');

module.exports = (agenda) => {
    agenda.define('send appointment reminder', async (job) => {
        const { to, userName, doctorName, appointmentDate, clinicAddress, rideLink } = job.attrs.data;

        const html = generateAppointmentReminderTemplate({
            userName,
            doctorName,
            appointmentDate,
            clinicAddress,
            rideLink
        });

        await sendEmail(to, 'Appointment Reminder', html);
    });
};