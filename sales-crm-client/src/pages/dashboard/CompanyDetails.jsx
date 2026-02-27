import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompanyById } from "../../API/services/companyService";
import {
    Building2, User, MapPin, Globe,
    Phone, Mail, Briefcase, Calendar,
    ArrowLeft, Info, Loader2, Share2,
    Users, Target, Layers
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

    const initials = company.name?.substring(0, 2).toUpperCase() || "CO";
    const colors = ["bg-red-600", "bg-orange-500", "bg-rose-500", "bg-red-400", "bg-pink-600"];
    const avatarColor = colors[(company.name?.charCodeAt(0) || 0) % colors.length];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <Share2 size={18} />
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all active:scale-[0.98]">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Identity & Core Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125"></div>
                        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className={`w-32 h-32 rounded-[2rem] ${avatarColor} flex items-center justify-center text-white text-4xl font-black border-[10px] border-white shadow-2xl flex-shrink-0 animate-in zoom-in duration-700`}>
                                {initials}
                            </div>
                            <div className="min-w-0 space-y-3">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight uppercase underline decoration-red-500 decoration-8 underline-offset-8 decoration-skip-ink-none">
                                    {company.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gray-900 text-white shadow-lg`}>
                                        {company.status || "Business Unit"}
                                    </span>
                                    <span className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                        <Layers size={16} className="text-red-500" />
                                        {company.industry || "General Industry"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-black uppercase tracking-widest">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <Users size={14} className="text-red-500" /> Size Band
                            </div>
                            <p className="text-xl text-gray-900">{company.size || "11-50"}</p>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-1/3"></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <Globe size={14} className="text-red-500" /> Origin
                            </div>
                            <p className="text-xl text-gray-900 truncate">{company.website?.replace(/^https?:\/\//, '') || "SALES.CRM"}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <Building2 size={14} className="text-red-500" /> Mandates
                            </div>
                            <p className="text-xl text-gray-900">Total Units</p>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-100 p-6">
                            <h3 className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
                                <Target size={20} className="text-red-500" /> Corporate Profile
                            </h3>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <section className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Operational Presence</label>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                                            <MapPin size={18} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 leading-relaxed italic uppercase">
                                            {company.address || "No central headquarters address recorded in master registry."}
                                        </p>
                                    </div>
                                </section>
                                <section className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Executive Summary</label>
                                    <div className="p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 text-sm text-gray-600 leading-relaxed italic">
                                        {company.notes || "No operational intelligence available for this entity."}
                                    </div>
                                </section>
                            </div>
                            <div className="space-y-6">
                                <section className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Communication Channels</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 text-sm font-bold text-gray-700 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                                            <Phone size={14} className="text-red-500" /> {company.phone || "No Registry Phone"}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-gray-700 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                                            <Mail size={14} className="text-red-500" /> {company.email || "registry@business.com"}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-gray-700 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                                            <Globe size={14} className="text-red-500" /> {company.website || "https://business.com"}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Governance & Ownership */}
                <div className="space-y-8">
                    {/* Stewardship Card */}
                    <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-[60px] -mr-24 -mt-24"></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Resource Ownership</h3>

                        <div className="space-y-6">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">Strategic Principal</span>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="w-14 h-14 rounded-2xl bg-white text-gray-900 flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                                    {company.ownerId?.firstName?.[0] || "U"}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-md font-black uppercase tracking-tight truncate">
                                        {`${company.ownerId?.firstName || ""} ${company.ownerId?.lastName || ""}`.trim() || "Unassigned"}
                                    </p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Acquisition Lead</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security & Logs</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-red-500" />
                                    <div>
                                        <p className="text-[9px] font-bold uppercase text-gray-500">Registry Created</p>
                                        <p className="text-xs font-black">{formatDate(company.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-gray-600" />
                                    <div>
                                        <p className="text-[9px] font-bold uppercase text-gray-500">Master Record Update</p>
                                        <p className="text-xs font-black text-gray-400">{formatDate(company.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reference Map */}
                    <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-100 flex flex-col items-center justify-center text-center space-y-4 overflow-hidden relative">
                        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                            <Building2 size={200} weight="black" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Master ID</p>
                        <p className="text-xs font-bold font-mono tracking-tighter opacity-60 truncate w-full">{company._id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
