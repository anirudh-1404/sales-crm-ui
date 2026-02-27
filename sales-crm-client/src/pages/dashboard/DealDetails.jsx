import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDealById } from "../../API/services/dealService";
import {
    Briefcase, Building2, User, DollarSign,
    Calendar, Clock, Target, Info,
    TrendingUp, ArrowLeft, Tag, Share2, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const stageBadge = {
    Lead: "bg-red-50 text-red-600 border border-red-100",
    Qualified: "bg-orange-50 text-orange-700 border border-orange-100",
    Proposal: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    Negotiation: "bg-orange-50 text-orange-700 border border-orange-100",
    "Closed Won": "bg-green-100 text-green-700 border border-green-200",
    "Closed Lost": "bg-red-100 text-red-700 border border-red-200",
};

const getProbabilityColor = (prob) => {
    if (prob >= 75) return "text-green-600";
    if (prob >= 40) return "text-orange-500";
    return "text-red-500";
};

const formatDate = (date) => {
    if (!date) return "Not Set";
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export default function DealDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                const res = await getDealById(id);
                setDeal(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch deal details");
            } finally {
                setLoading(false);
            }
        };
        fetchDeal();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-semibold">Deal not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    const initials = deal.name?.substring(0, 2).toUpperCase() || "DL";
    const colors = ["bg-red-600", "bg-orange-500", "bg-rose-500", "bg-red-400", "bg-pink-600"];
    const avatarColor = colors[(deal.name?.charCodeAt(0) || 0) % colors.length];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to records</span>
                </button>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <Share2 size={18} />
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all active:scale-[0.98]">
                        Edit Opportunity
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125"></div>
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className={`w-24 h-24 rounded-3xl ${avatarColor} flex items-center justify-center text-white text-3xl font-bold border-8 border-white shadow-xl flex-shrink-0`}>
                                {initials}
                            </div>
                            <div className="min-w-0 space-y-2">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight uppercase">{deal.name}</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`px-4 py-1 rounded-full text-[11px] font-black border uppercase tracking-widest ${stageBadge[deal.stage] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                        {deal.stage}
                                    </span>
                                    <span className="text-gray-200">|</span>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                        <Building2 size={16} className="text-red-400" />
                                        <span className="hover:text-red-500 cursor-pointer transition-colors" onClick={() => navigate(`/dashboard/companies/${deal.companyId?._id}`)}>
                                            {deal.companyId?.name || deal.companyName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <DollarSign size={14} className="text-red-500" /> Deal Value
                            </div>
                            <p className="text-2xl font-black text-gray-900 leading-none">
                                {deal.currency} {deal.value?.toLocaleString() || "0"}
                            </p>
                            <p className="text-xs text-gray-500">Total estimated revenue</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <TrendingUp size={14} className="text-green-500" /> Probability
                            </div>
                            <div className="flex items-end gap-2">
                                <p className={`text-2xl font-black leading-none ${getProbabilityColor(deal.probability)}`}>
                                    {deal.probability}%
                                </p>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full mb-1 overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-1000"
                                        style={{ width: `${deal.probability}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Confidence score</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <Calendar size={14} className="text-orange-500" /> Timeline
                            </div>
                            <p className="text-lg font-black text-gray-900 leading-none">
                                {formatDate(deal.expectedCloseDate)}
                            </p>
                            <p className="text-xs text-gray-500 italic">Target closing date</p>
                        </div>
                    </div>

                    {/* Detailed Overview */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-3 text-lg font-black text-gray-900 uppercase tracking-tighter">
                                <Info size={20} className="text-red-500" /> Opportunity Intelligence
                            </h3>
                            <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Source: {deal.source || "Direct"}</div>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50 italic min-h-[120px]">
                            {deal.notes || "No strategic overview provided for this mandate."}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stakeholders & Metadata */}
                <div className="space-y-8">
                    {/* Stakeholder Card */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <User size={16} className="text-red-500" /> Stakeholders
                        </h3>

                        {/* Primary Contact */}
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Primary Liaison</span>
                            <div
                                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer group"
                                onClick={() => navigate(`/dashboard/contacts/${deal.contactId?._id}`)}
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg group-hover:scale-110 transition-transform">
                                    {(deal.contactId?.firstName?.[0] || deal.contactName?.[0] || "?").toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-900 truncate">
                                        {deal.contactId ? `${deal.contactId.firstName || ""} ${deal.contactId.lastName || ""}`.trim() : (deal.contactName || "Direct Inquiry")}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{deal.contactId?.jobTitle || "Business Contact"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        {/* Owner */}
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Strategic Account Lead</span>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold text-sm">
                                    {deal.ownerId?.firstName?.[0] || "U"}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-900 truncate">
                                        {`${deal.ownerId?.firstName || ""} ${deal.ownerId?.lastName || ""}`.trim() || "Unassigned"}
                                    </p>
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Strategic Account Unit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-gray-900 p-8 rounded-3xl text-white space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">System Logs</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500">Established</p>
                                    <p className="text-xs font-bold">{formatDate(deal.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500">Last Intelligence Update</p>
                                    <p className="text-xs font-bold">{formatDate(deal.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 h-px bg-white/5"></div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Reference: {deal._id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
