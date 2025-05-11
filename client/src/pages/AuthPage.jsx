import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import Logo from '../assets/logo.png'

const signupSchema = z.object({
    name: z.string()
        .min(4, "Name must be at least 4 characters")
        .regex(/^[A-Za-z\s]+$/, "Name must contain only letters"),
    role: z.enum(["doctor", "patient"]),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

const signinSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export default function AuthPage() {
    const [mode, setMode] = useState("signin");
    const [showPassword, setShowPassword] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const {
        register: signupRegister,
        handleSubmit: handleSignupSubmit,
        formState: { errors: signupErrors, isValid: isSignupValid },
    } = useForm({
        resolver: zodResolver(signupSchema),
        mode: "onChange",
    });

    const {
        register: signinRegister,
        handleSubmit: handleSigninSubmit,
        formState: { errors: signinErrors, isValid: isSigninValid },
    } = useForm({
        resolver: zodResolver(signinSchema),
        mode: "onChange",
    });

    const handleSignup = async (data) => {
        try {
            const response = await apiConnector("POST", "http://localhost:5000/api/auth/signup", {
                name: data.name,
                role: data.role,
                email: data.email,
                password: data.password,
            });
            console.log("hjdsgjkf", response);
            if (response.data.success) {
                toast.success("Registration successful!");
                setRedirect(true);
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } catch (error) {
            console.log(error.message);
            toast.error("An error occurred during registration.");
        }
    };

    const handleSignin = async (data) => {
        try {
            const response = await apiConnector("POST", "http://localhost:5000/api/auth/login", {
                email: data.email,
                password: data.password,
            });

            if (response.data.success) {
                const { user, token } = response.data;

                // Store in localStorage
                localStorage.setItem(
                    "auth",
                    JSON.stringify({ user, token })
                );

                toast.success("Login successful!");
                setRedirect(true);
            } else {
                toast.error("Invalid credentials. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during login.");
        }
    };

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
                <span className="p-1 rounded-full bg-gray-100 inline-block">
                    <img src={Logo} alt="" className="w-9 h-9 object-cover rounded-full" />
                </span>
                <h1 className="text-3xl font-bold text-gray-900">DocSure</h1>
                <p className="text-gray-500 mt-1">Your health companion</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mb-4">
                <button
                    onClick={() => setMode("signin")}
                    className={`font-semibold ${mode === "signin" ? "text-blue-600" : "text-gray-500"}`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => setMode("signup")}
                    className={`font-semibold ${mode === "signup" ? "text-blue-600" : "text-gray-500"}`}
                >
                    Sign Up
                </button>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-md px-8 py-8 w-full max-w-md">
                {mode === "signup" ? (
                    <form onSubmit={handleSignupSubmit(handleSignup)}>
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Create Account</h2>

                        <label className="block text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 mb-2 focus:outline-none"
                            {...signupRegister("name")}
                        />
                        {signupErrors.name && (
                            <p className="text-red-500 text-sm mb-2">{signupErrors.name.message}</p>
                        )}

                        <label className="block text-gray-700 mb-1">Role</label>
                        <select
                            className="w-full border rounded px-3 py-2 mb-4 focus:outline-none"
                            {...signupRegister("role")}
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>

                        <label className="block text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full border rounded px-3 py-2 mb-2 focus:outline-none"
                            {...signupRegister("email")}
                        />
                        {signupErrors.email && (
                            <p className="text-red-500 text-sm mb-2">{signupErrors.email.message}</p>
                        )}

                        <label className="block text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border rounded px-3 py-2 mb-2 focus:outline-none"
                                {...signupRegister("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {signupErrors.password && (
                            <p className="text-red-500 text-sm mb-2">{signupErrors.password.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={!isSignupValid}
                            className={`w-full font-semibold py-2 rounded transition ${isSignupValid
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            Register
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSigninSubmit(handleSignin)}>
                        <h2 className="text-xl font-semibold mb-6 text-gray-900">Sign in with email</h2>
                        <label className="block text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full border rounded px-3 py-2 mb-2 focus:outline-none"
                            {...signinRegister("email")}
                        />
                        {signinErrors.email && (
                            <p className="text-red-500 text-sm mb-2">{signinErrors.email.message}</p>
                        )}

                        <label className="block text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border rounded px-3 py-2 mb-2 focus:outline-none"
                                {...signinRegister("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {signinErrors.password && (
                            <p className="text-red-500 text-sm mb-2">{signinErrors.password.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={!isSigninValid}
                            className={`w-full font-semibold py-2 rounded transition ${isSigninValid
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            Sign In
                        </button>
                    </form>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-6 text-center max-w-sm">
                By continuing, you agree to our{" "}
                <a href="#" className="text-blue-600 underline">
                    Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 underline">
                    Privacy Policy
                </a>
                .
            </p>
        </div>
    );
}