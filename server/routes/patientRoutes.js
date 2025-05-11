const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Get patient by userId
router.get('/:patientId', patientController.getPatientById);

// Update patient by _id
router.put('/update/:userId', patientController.updatePatient);

// Get patient bookings
router.get('/bookings/:patientId', patientController.getBookingsForPatient);

module.exports = router;