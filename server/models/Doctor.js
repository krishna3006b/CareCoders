const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bio: {
        type: String
    },
    education: {
        type: String
    },
    experience: {
        type: String
    },
    specialties: [String],
    clinicLocation: {
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number }
    },
    availableSlots: [{
        date: String,
        start: String,
        end: String
    }],
    bookedSlots: [{
        date: String,
        start: String,
        end: String,
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient'
        },
        patientName: String,
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled'],
            default: 'scheduled'
        }
    }],
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);