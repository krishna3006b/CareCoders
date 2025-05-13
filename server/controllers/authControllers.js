const User = require("../models/User");
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

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

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }

        const newUser = new User({ email, password, name, phone, role });
        await newUser.save();

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

        try {
            const res = await mailSender(email, "Registration on DocSure", "Welcome to DocSure! Your account has been created successfully.");
        } catch (error) {
            console.log(error.message);
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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }

        const token = generateToken(user);

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