const User = require("../models/User");
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Put your secret key here

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        SECRET_KEY,
        { expiresIn: '7d' }
    );
};

exports.signup = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;

        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        // Create new User with shared fields
        const newUser = new User({ email, password, name, phone, role });
        await newUser.save();

        // Create role-specific document
        if (role === "patient") {
            await Patient.create({
                userId: newUser._id,
                location: "",
                insuranceProvider: "",
                policyNumber: "",
                familyMembers: []
            });
        } else if (role === "doctor") {
            await Doctor.create({
                userId: newUser._id,
                bio: "",
                education: "",
                experience: "",
                specialties: [],
                clinicLocation: {},
                availableSlots: []
            });
        }

        return res.status(201).json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            },
            message: `${role} profile created.`
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        // Generate token
        const token = generateToken(user);

        // Fetch role-specific profile
        let profile = null;
        if (user.role === 'patient') {
            profile = await Patient.findOne({ userId: user._id });
        } else if (user.role === 'doctor') {
            profile = await Doctor.findOne({ userId: user._id });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            profile,
            token
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message
        });
    }
};