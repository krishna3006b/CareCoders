const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token || req.body?.token;

        const authHeader = req.headers.authorization;
        if (!token && authHeader?.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token missing',
            });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
            next();
        } catch (err) {
            console.log(err.message);
            return res.status(401).json({
                success: false,
                message: 'Token is invalid',
            });
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            errorMessage: error.message,
            message: 'Internal Server Error!',
        });
    }
}

exports.isDoctor = async (req, res, next) => {
    try {
        const { role } = req.user;

        if (role !== 'doctor') {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Doctor",
            });
        }

        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            errorMessage: error.message,
            message: 'Internal Server Error!'
        });
    }
}

exports.isPatient = async (req, res, next) => {
    try {
        const { role } = req.user;

        if (role !== 'patient') {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Patient",
            });
        }

        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            errorMessage: error.message,
            message: 'Internal Server Error!'
        });
    }
}