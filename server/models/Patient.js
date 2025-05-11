// models/Patient.js
const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    relationship: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    }
}, { timestamps: true, _id: true });

const patientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String
    },
    insuranceProvider: {
        type: String
    },
    policyNumber: {
        type: String
    },
    familyMembers: [familyMemberSchema],
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);