const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.get('/:patientId', patientController.getPatientById);
router.put('/update/:userId', patientController.updatePatient);
router.get('/bookings/:patientId', patientController.getBookingsForPatient);

module.exports = router;