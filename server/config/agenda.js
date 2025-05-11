const Agenda = require("agenda");
require("dotenv").config();

const agenda = new Agenda({
    db: { address: process.env.MONGO_URI, collection: "agendaJobs" }
});

agenda.define("send appointment reminder", async (job) => {
    const { userData, appointmentData } = job.attrs.data;
    const sendAppointmentReminder = require("../utils/sendAppointmentReminder");
    await sendAppointmentReminder(userData, appointmentData);
});

(async function () {
    await agenda.start();
})();

module.exports = agenda;