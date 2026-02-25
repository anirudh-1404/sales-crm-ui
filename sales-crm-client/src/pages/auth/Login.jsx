import React, { useState, useEffect } from "react";
import Logo from "../../components/Logo";
import { Link, useNavigate } from "react-router-dom";
import loginBg from "../../assets/login-bg.jpg";
import { useAuth } from "../../context/AuthContext";
import API from "../../../API/Interceptor";
import toast from "react-hot-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [rememberedUser, setRememberedUser] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem("rememberedUser");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setRememberedUser(user);
                setFormData(prev => ({ ...prev, email: user.email }));
            } catch (e) {
                localStorage.removeItem("rememberedUser");
            }
        }
    }, []);

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

            if (rememberMe) {
                localStorage.setItem("rememberedUser", JSON.stringify({
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }));
            } else {
                localStorage.removeItem("rememberedUser");
            }

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
        `w-full border rounded-lg px-4 py-2 ${field === "password" ? "pr-10" : ""} focus:outline-none focus:ring-2 shadow-sm transition ${errors[field]
            ? "border-red-400 focus:ring-red-300 bg-red-50"
            : "border-gray-300 focus:ring-red-500"
        }`;

    return (
        <section className="h-screen bg-gray-100 grid grid-cols-1 lg:grid-cols-2">

            <div className="h-screen overflow-y-auto bg-white p-12">
                <div className="w-full max-w-md mx-auto">
                    <Logo />
                    {rememberedUser ? (
                        <div className="text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                    <span className="text-3xl font-bold text-red-600 uppercase">
                                        {rememberedUser.firstName[0]}{rememberedUser.lastName[0]}
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h2>
                            <p className="text-gray-600 mb-8 font-medium">{rememberedUser.firstName} {rememberedUser.lastName}</p>

                            <form onSubmit={handleSubmission} noValidate className="text-left">
                                <div className="mb-6">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={fieldClass("password")}
                                        placeholder="Enter Your Password"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition shadow-lg shadow-red-200 cursor-pointer ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {submitting ? "Logging In..." : "Log In"}
                                </button>

                                <div className="mt-8 text-center space-y-4">
                                    <Link to="/forgot-password">
                                        <button type="button" className="text-red-600 text-sm font-semibold hover:underline cursor-pointer block w-full">
                                            Forgot Password?
                                        </button>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRememberedUser(null);
                                            setFormData({ email: "", password: "" });
                                            localStorage.removeItem("rememberedUser");
                                        }}
                                        className="text-gray-500 text-sm hover:text-gray-800 transition font-medium cursor-pointer"
                                    >
                                        Not you? <span className="text-red-600 underline">Switch account</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
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
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={fieldClass("password")}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOpen /> : <EyeOff />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div className="flex justify-between items-center mb-6 text-sm">
                                    <label className="flex items-center gap-2 text-gray-600 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 accent-red-600 cursor-pointer"
                                        />
                                        <span className="group-hover:text-gray-900 transition font-medium">Remember me</span>
                                    </label>
                                    <Link to="/forgot-password">
                                        <button type="button" className="text-red-600 font-semibold hover:underline cursor-pointer">
                                            Forgot Password?
                                        </button>
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-red-600 hover:bg-orange-400 text-white py-3 rounded-lg font-semibold transition duration-300 cursor-pointer shadow-lg shadow-red-100 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {submitting ? "Signing In..." : "Sign In"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <div className="hidden lg:block h-screen p-3">
                <img src={loginBg} alt="login-img" className="w-full h-full object-cover rounded-lg" />
            </div>

            <div className="text-center pb-4">
                <p className="text-black mb-0">Copyright &copy; mbdConsulting</p>
            </div>

        </section>
    );
};

export default Login;
