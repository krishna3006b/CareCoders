const express = require('express');
const router = express.Router();
const { createBooking, updateBookingStatus } = require('../controllers/bookingController');
const { isAuth, isPatient } = require('../middleware/auth');

router.post('/', isAuth, isPatient, createBooking);
router.put('/:bookingId/status', isAuth, updateBookingStatus);

module.exports = router;