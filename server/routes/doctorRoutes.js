const express = require('express');
const router = express.Router();
const {
    updateDoctorProfile,
    getTodayAppointments
} = require('../controllers/doctorController');
const { isAuth } = require('../middleware/auth');

// router.get('/:doctorId', isAuth, getDoctorById);
router.put('/:doctorId', isAuth, updateDoctorProfile);
router.get('/appointments/doctor/:doctorId/today', isAuth, getTodayAppointments);

module.exports = router;