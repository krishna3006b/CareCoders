const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
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
    specialties: [{
        type: String
    }],
    clinicLocation: {
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number }
    },
    availableSlots: [{
        date: { type: String },
        start: { type: String },
        end: { type: String }
    }],
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Doctor', doctorSchema);