import React, { useState } from "react";
import Logo from "../../components/Logo";
import { Link, useNavigate } from "react-router-dom";
import loginBg from "../../assets/login-bg.jpg";
import { useAuth } from "../../context/AuthContext";
import API from "../../../API/Interceptor";
import toast from "react-hot-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.email.trim()) errs.email = "Email is required";
        else if (!emailRegex.test(formData.email.trim())) errs.email = "Enter a valid email address";
        if (!formData.password) errs.password = "Password is required";
        else if (formData.password.length < 6) errs.password = "Password must be at least 6 characters";
        return errs;
    };

    const loginFunction = async (data) => {
        setSubmitting(true);
        try {
            const response = await API.post("/auth/login", data);
            const user = response.data.data;
            login(user);
            toast.success("Login successful!");
            if (user.role === "admin") navigate("/dashboard");
            else if (user.role === "sales_manager") navigate("/manager");
            else if (user.role === "sales_rep") navigate("/rep");
            else navigate("/");
        } catch (error) {
            console.error("Login Error:", error.message);
            const msg = error.response?.data?.message;
            toast.error(msg || "Invalid credentials. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmission = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        loginFunction(formData);
    };

    const fieldClass = (field) =>
        `w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 shadow-sm transition ${errors[field]
            ? "border-red-400 focus:ring-red-300 bg-red-50"
            : "border-gray-300 focus:ring-red-500"
        }`;

    return (
        <section className="h-screen bg-gray-100 grid grid-cols-1 md:grid-cols-2">

            <div className="h-screen overflow-y-auto bg-white p-12">
                <div className="w-full max-w-md mx-auto">
                    <Logo />
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">Sign In</h2>
                    <p className="text-gray-500 mb-6">
                        Access the CRM panel using your email and passcode
                    </p>
                    <form onSubmit={handleSubmission} noValidate>
                        <div className="mb-5">
                            <label className="block mb-2 font-medium text-gray-700" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={fieldClass("email")}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={fieldClass("password")}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center gap-3 text-gray-700">
                                <input type="checkbox" className="w-5 h-5 accent-red-600 cursor-pointer" />
                                Remember me
                            </label>
                            <Link to="/forgot-password">
                                <button type="button" className="text-red-600 font-medium hover:underline">
                                    Forgot Password?
                                </button>
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full bg-red-600 hover:bg-orange-400 text-white py-3 rounded-lg font-semibold transition duration-300 cursor-pointer ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {submitting ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden md:block h-screen p-3">
                <img src={loginBg} alt="login-img" className="w-full h-full object-cover rounded-lg" />
            </div>

            <div className="text-center pb-4">
                <p className="text-black mb-0">Copyright &copy; - CRMS</p>
            </div>

        </section>
    );
};

export default Login;
