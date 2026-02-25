import React, { useState } from "react";
import Logo from "../../components/Logo";
import { Link, useNavigate } from "react-router-dom";
import forgotBg from "../../assets/forgot-bg.jpg";
import toast from "react-hot-toast";
import { forgotPassword } from "../../../API/services/userService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (!emailRegex.test(email.trim())) {
            setError("Enter a valid email address");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await forgotPassword(email.trim());
            toast.success("Reset instructions sent to your email!");
            navigate("/email-verification", { state: { email: email.trim() } });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to send reset link");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="h-screen bg-gray-100 grid grid-cols-1 lg:grid-cols-2">

            <div className="h-screen overflow-y-auto bg-white p-12">
                <div className="w-full max-w-md mx-auto">

                    <Logo />

                    <h2 className="text-3xl font-bold mb-2 mt-10 text-gray-800">Forgot Password?</h2>
                    <p className="text-gray-500 mb-6">
                        If you forgot your password, well, then we'll email you instructions
                        to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-6">
                            <label className="block mb-2 font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError("");
                                    }}
                                    className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 shadow-sm transition ${error
                                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                                        : "border-gray-300 focus:ring-red-500"
                                        }`}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
                            </div>
                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full bg-red-600 hover:bg-orange-400 text-white py-3 rounded-lg font-semibold transition duration-300 cursor-pointer ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {submitting ? "Sending..." : "Submit"}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-600 text-sm">
                        Return to{" "}
                        <Link to="/login" className="text-blue-600 font-bold cursor-pointer hover:text-red-600 hover:underline">
                            Login
                        </Link>
                    </p>

                </div>
            </div>

            <div className="hidden lg:block h-screen p-3">
                <img src={forgotBg} alt="forgot-password-img" className="w-full h-full object-cover rounded-lg" />
            </div>

            <div className="text-center pb-4">
                <p className="text-black mb-0">Copyright &copy; mbdConsulting</p>
            </div>

        </section>
    );
};

export default ForgotPassword;