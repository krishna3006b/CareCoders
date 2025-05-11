const express = require('express');
const router = express.Router();
const { createBooking, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { isAuth } = require('../middleware/auth');

// Temporarily removed isPatient middleware for testing
router.post('/', isAuth, createBooking);
router.delete('/:bookingId', isAuth, deleteBooking);
router.put('/:bookingId/status', isAuth, updateBookingStatus);

module.exports = router;