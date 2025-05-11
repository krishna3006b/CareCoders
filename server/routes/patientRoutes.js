const express = require('express');
const router = express.Router();
const {
    getPatientById,
    updatePatient,
    getBookingsForPatient
} = require('../controllers/patientController');
const { isAuth, isPatient } = require('../middleware/auth');

router.get('/:patientId', isAuth, isPatient, getPatientById);
router.put('/:id', isAuth, isPatient, updatePatient);
router.get('/appointments/patient/:patientId', isAuth, getBookingsForPatient);

module.exports = router;