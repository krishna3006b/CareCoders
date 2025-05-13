const Patient = require('../models/Patient');
const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getPatientById = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        const patient = await Patient.findOne({ userId: patientId })
            .populate('userId');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        const data = {
            _id: patient._id,
            userId: patient.userId._id,
            name: patient.userId.name,
            email: patient.userId.email,
            phone: patient.userId.phone,
            location: patient.location,
            insuranceProvider: patient.insuranceProvider,
            policyNumber: patient.policyNumber,
            familyMembers: patient.familyMembers.map(fm => ({
                _id: fm._id,
                name: fm.name,
                relationship: fm.relationship,
                dateOfBirth: fm.dateOfBirth
            }))
        }

        return res.status(200).json({
            success: true,
            patient: data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};

exports.getBookingsForPatient = async (req, res) => {
    try {
        const userId = req.params.patientId;

        const patient = await Patient.findOne({ userId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const bookings = await Booking.find({ patientId: patient._id })
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name email phone image'
                }
            })
            .exec();

        return res.status(200).json({
            success: true,
            appointments: bookings.map(booking => {
                if (!booking.doctorId) {
                    console.warn(`Booking ${booking._id} has no doctorId`);
                }
                if (booking.doctorId && !booking.doctorId.userId) {
                    console.warn(`Doctor ${booking.doctorId._id} for booking ${booking._id} has no userId`);
                }
                return {
                    _id: booking._id,
                    doctorId: (booking.doctorId && booking.doctorId.userId) ? {
                        _id: booking.doctorId._id,
                        name: booking.doctorId.userId.name,
                        image: booking.doctorId.userId.image,
                        specialties: booking.doctorId.specialties
                    } : null,
                    familyMemberName: booking.familyMemberName,
                    appointmentTime: booking.appointmentTime,
                    specialty: booking.specialty,
                    status: booking.status
                };
            })
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { familyMembers = [], email, ...updateData } = req.body;

        const userUpdateData = {
            name: updateData.name,
            phone: updateData.phone
        };

        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
            userUpdateData.email = email;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            userUpdateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const patient = await Patient.findOne({ userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        if (Array.isArray(familyMembers)) {
            const formattedNewMembers = familyMembers.map(member => ({
                ...member,
                dateOfBirth: new Date(member.dateOfBirth)
            }));

            const isSameMember = (member1, member2) => {
                return member1.name.toLowerCase() === member2.name.toLowerCase() &&
                    new Date(member1.dateOfBirth).getTime() === new Date(member2.dateOfBirth).getTime();
            };

            const removedMembers = patient.familyMembers.filter(existingMember =>
                !formattedNewMembers.some(newMember => isSameMember(existingMember, newMember))
            );

            const addedMembers = formattedNewMembers.filter(newMember =>
                !patient.familyMembers.some(existingMember => isSameMember(existingMember, newMember))
            );

            const updatedMembers = formattedNewMembers.filter(newMember =>
                patient.familyMembers.some(existingMember => isSameMember(existingMember, newMember))
            ).map(newMember => {
                const existingMember = patient.familyMembers.find(em => isSameMember(em, newMember));
                return {
                    ...existingMember.toObject(),
                    relationship: newMember.relationship
                };
            });

            patient.familyMembers = [
                ...updatedMembers,
                ...addedMembers
            ];
        }

        patient.location = updateData.location;
        patient.insuranceProvider = updateData.insuranceProvider;
        patient.policyNumber = updateData.policyNumber;

        await patient.save();

        const responseData = {
            patient: {
                _id: patient._id,
                userId: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                location: patient.location,
                insuranceProvider: patient.insuranceProvider,
                policyNumber: patient.policyNumber,
                familyMembers: patient.familyMembers
            }
        };

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: responseData
        });

    } catch (error) {
        console.error('Update patient error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
};