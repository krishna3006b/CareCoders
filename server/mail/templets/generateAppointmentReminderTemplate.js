exports.generateAppointmentReminderTemplate = ({ userName, doctorName, appointmentDate, clinicAddress, rideLink }) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2b7a78;">📅 Appointment Reminder</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>This is a friendly reminder that you have an upcoming appointment.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td><strong>Doctor:</strong></td>
          <td>${doctorName}</td>
        </tr>
        <tr>
          <td><strong>Date & Time:</strong></td>
          <td>${new Date(appointmentDate).toLocaleString()}</td>
        </tr>
        <tr>
          <td><strong>Clinic Address:</strong></td>
          <td>${clinicAddress}</td>
        </tr>
      </table>
      <a href="${rideLink}" style="display: inline-block; background-color: #3aafa9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Ride Path ➡️
      </a>
      <p style="margin-top: 20px;">Thank you for using our platform. Stay healthy!</p>
    </div>
  `;
};