const Patient = require('../models/Patient');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Get patient by userId
exports.getPatientById = async (req, res) => {
    try {
        const patientId = req.params.patientId;

        // Find the patient by userId
        const patient = await Patient.findOne({ userId: patientId })
            .populate('userId'); // populate the user details (assuming there is a 'User' model)

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

        // Return patient data in the desired format
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

// GET Bookings for a Patient
exports.getBookingsForPatient = async (req, res) => {
    try {
        const userId = req.params.patientId;

        // First find the patient using userId
        const patient = await Patient.findOne({ userId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Then find bookings using patient._id and populate doctor details
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

        // Update user basic info
        const userUpdateData = {
            name: updateData.name,
            phone: updateData.phone
        };

        // If email is provided and different from current email
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

        // Find the patient
        const patient = await Patient.findOne({ userId });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        // Handle family members update using name and date of birth comparison
        if (Array.isArray(familyMembers)) {
            // Format incoming dates
            const formattedNewMembers = familyMembers.map(member => ({
                ...member,
                dateOfBirth: new Date(member.dateOfBirth)
            }));

            // Function to check if two members are the same based on name and DOB
            const isSameMember = (member1, member2) => {
                return member1.name.toLowerCase() === member2.name.toLowerCase() &&
                    new Date(member1.dateOfBirth).getTime() === new Date(member2.dateOfBirth).getTime();
            };

            // Find members to be removed (exist in DB but not in new data)
            const removedMembers = patient.familyMembers.filter(existingMember =>
                !formattedNewMembers.some(newMember => isSameMember(existingMember, newMember))
            );

            // Find members to be added (exist in new data but not in DB)
            const addedMembers = formattedNewMembers.filter(newMember =>
                !patient.familyMembers.some(existingMember => isSameMember(existingMember, newMember))
            );

            // Find members to be updated (exist in both but might have different relationship)
            const updatedMembers = formattedNewMembers.filter(newMember =>
                patient.familyMembers.some(existingMember => isSameMember(existingMember, newMember))
            ).map(newMember => {
                const existingMember = patient.familyMembers.find(em => isSameMember(em, newMember));
                return {
                    ...existingMember.toObject(),
                    relationship: newMember.relationship
                };
            });

            // Set the new family members array
            patient.familyMembers = [
                ...updatedMembers,
                ...addedMembers
            ];
        }

        // Update other patient fields
        patient.location = updateData.location;
        patient.insuranceProvider = updateData.insuranceProvider;
        patient.policyNumber = updateData.policyNumber;

        // Save the updated patient
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