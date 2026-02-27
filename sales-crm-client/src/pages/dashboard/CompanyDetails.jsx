import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompanyById } from "../../../API/services/companyService";
import {
    Building2, User, MapPin, Globe,
    Phone, Mail, Briefcase, Calendar, Clock,
    ArrowLeft, Info, Loader2, Share2,
    Users, Target, Layers, DollarSign
} from "lucide-react";
import toast from "react-hot-toast";

const formatDate = (date) => {
    if (!date) return "Not Set";
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export default function CompanyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await getCompanyById(id);
                setCompany(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch company details");
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    const getInitials = (name) => {
        if (!name) return "C";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-semibold">Company not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Back</span>
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${company.status === "Customer" ? "bg-green-100 text-green-700 border-green-200" :
                    company.status === "Prospect" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        company.status === "Churned" ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                    {company.status || "Lead"}
                </span>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-sm ring-1 ring-gray-100 uppercase">
                        {getInitials(company.name)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    {/* Identification */}
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-gray-400 block mb-1">Industry</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Layers size={16} className="text-red-400" />
                                {company.industry || "N/A"}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Company Size</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Users size={16} className="text-red-400" />
                                {company.size || "N/A"} employees
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Website</label>
                            <div className="flex items-center gap-2 font-medium text-red-600">
                                <Globe size={16} className="text-red-400" />
                                <a href={company.website?.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {company.website || "N/A"}
                                </a>
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Revenue Range</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <DollarSign size={16} className="text-green-500" />
                                {company.revenueRange || "N/A"}
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-gray-400 block mb-1">Primary Contact Name</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <User size={16} className="text-red-400" />
                                {company.primaryContact || "N/A"}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Phone</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Phone size={16} className="text-red-400" />
                                {company.phone || "N/A"}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Office Address</label>
                            <div className="flex items-start gap-2 font-medium text-gray-900">
                                <MapPin size={16} className="text-red-400 mt-0.5" />
                                <span className="flex-1">{company.address || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="md:col-span-2 pt-4 border-t border-gray-50">
                        <label className="text-gray-400 text-sm block mb-2">Internal Notes</label>
                        <div className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                            {company.notes || "No operational intelligence available."}
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-50 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock size={12} /> Managed by: {company.ownerId?.firstName} {company.ownerId?.lastName}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> Registry Date: {formatDate(company.createdAt)}</span>
                    </div>
                    <span className="uppercase tracking-wider">REF: {company._id}</span>
                </div>
            </div>
        </div>
    );
}
