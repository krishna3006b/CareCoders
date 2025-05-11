const express = require('express');
const router = express.Router();
const {
    updateDoctorProfile,
    getDoctorProfile,
    getTodayAppointments,
    getAllDoctors
} = require('../controllers/doctorController');
const { isAuth } = require('../middleware/auth');

router.get('/', isAuth, getAllDoctors);
router.get('/profile/:userId', isAuth, getDoctorProfile);
router.put('/profile/:userId', isAuth, updateDoctorProfile);
router.get('/appointments/today/:doctorId', isAuth, getTodayAppointments);

module.exports = router;