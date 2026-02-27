import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getDealById } from "../../../API/services/dealService";
import {
    Briefcase, Building2, User, DollarSign,
    Calendar, Clock, Target, Info,
    TrendingUp, ArrowLeft, Tag, Share2, Loader2,
    Star, RotateCw, Maximize2, Lock, ThumbsUp,
    MoreHorizontal, Download, ChevronRight,
    MapPin, Mail, Phone, FileText, Paperclip, List
} from "lucide-react";
import toast from "react-hot-toast";

const pipelineStages = [
    { id: "Lead", label: "Quality To Buy" },
    { id: "Qualified", label: "Contact Made" },
    { id: "Proposal", label: "Presentation" },
    { id: "Negotiation", label: "Proposal Made" },
    { id: "Closed Won", label: "Appointment" } // Simplified mapping for UI consistency with image
];

const formatDate = (date, includeTime = false) => {
    if (!date) return "Not Set";
    const options = {
        day: "numeric",
        month: "short",
        year: "numeric",
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(date).toLocaleString("en-IN", options);
};

export default function DealDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Activities");

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

    const getInitials = (name) => {
        if (!name) return "D";
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

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className="font-bold text-gray-900">Deals</span>
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">125</span>
                        <ChevronRight size={14} className="text-gray-300" />
                        <Link to="/dashboard" className="hover:text-red-600">Home</Link>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-400">Deals</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={14} className="text-gray-400" />
                        Export
                        <ChevronRight size={12} className="rotate-90 text-gray-400" />
                    </button>
                    <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                        <RotateCw size={16} />
                    </button>
                    <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            <Link to="/dashboard/deals" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-4">
                <ArrowLeft size={18} />
                Back to Deals
            </Link>

            {/* Hero Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-white shadow-md flex items-center justify-center text-orange-500 text-2xl font-black ring-1 ring-orange-100 uppercase">
                        {getInitials(deal.name)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-gray-900 leading-none">{deal.name}</h1>
                            <Star size={18} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <Building2 size={14} className="text-gray-300" />
                                <button
                                    onClick={() => deal.companyId?._id && navigate(`/dashboard/companies/${deal.companyId._id}`)}
                                    className="hover:text-red-600 underline decoration-gray-200 underline-offset-4"
                                >
                                    {deal.companyId?.name || deal.companyName || "No Company"}
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <MapPin size={12} className="text-gray-300" />
                                    <span>{deal.companyId?.address || "Location not specified"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-red-500 font-bold">
                                    <User size={12} className="text-red-400" />
                                    {deal.contactId?._id ? (
                                        <button
                                            onClick={() => navigate(`/dashboard/contacts/${deal.contactId._id}`)}
                                            className="hover:underline"
                                        >
                                            {deal.contactId.firstName} {deal.contactId.lastName}
                                        </button>
                                    ) : (
                                        <span>{deal.contactName || "No Contact"}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-red-100">
                        <Lock size={12} />
                        Private
                    </span>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
                        <ThumbsUp size={14} />
                        Won
                        <ChevronRight size={12} className="rotate-90 opacity-50" />
                    </button>
                </div>
            </div>

            {/* Main Content Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Information */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Deals Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <h3 className="text-sm font-black text-gray-900">Deals Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium leading-none">Date Created</span>
                                <span className="text-gray-900 font-bold">{formatDate(deal.createdAt, true)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium leading-none">Probability - Win</span>
                                <span className="text-gray-900 font-extrabold">{deal.probability || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium leading-none">Deal Value</span>
                                <span className="text-gray-900 font-extrabold text-sm">{deal.currency} {deal.value?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium leading-none">Due Date</span>
                                <span className="text-gray-900 font-bold">{formatDate(deal.expectedCloseDate, true)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium leading-none">Follow Up</span>
                                <span className="text-gray-900 font-bold">{formatDate(deal.expectedCloseDate)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium leading-none">Source</span>
                                <span className="text-gray-900 font-bold capitalize">{deal.source || "Direct"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deal Owner */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900">Deal Owner</h3>
                            <button className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest">+ Add New</button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-red-50">
                                    {deal.ownerId?.firstName?.[0]}{deal.ownerId?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800 leading-none">{deal.ownerId?.firstName} {deal.ownerId?.lastName || "Not Assigned"}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1">Relationship Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Pipeline & Interactions */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Pipeline Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-900">Deals Pipeline Status</h3>
                        <div className="flex flex-wrap items-center">
                            {pipelineStages.map((stage, index) => {
                                const isActive = deal.stage === stage.id || (deal.stage === "Closed Won" && index <= 4);
                                return (
                                    <div key={stage.id} className="flex-1 min-w-[120px] relative group h-10 mb-2 mr-2">
                                        <div className={`
                                            h-full w-full flex items-center justify-center text-[10px] font-bold px-4
                                            transition-all duration-300 cursor-default
                                            ${isActive
                                                ? (index === 0 ? "bg-blue-700 text-white" : index === 1 ? "bg-amber-400 text-white" : index === 2 ? "bg-orange-600 text-white" : index === 3 ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-500")
                                                : "bg-gray-100 text-gray-400"}
                                            ${index === 0 ? "rounded-l-lg" : ""}
                                            ${index === pipelineStages.length - 1 ? "rounded-r-lg" : ""}
                                            relative z-10
                                        `}
                                            style={{
                                                clipPath: index === 0
                                                    ? "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)"
                                                    : index === pipelineStages.length - 1
                                                        ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10% 50%)"
                                                        : "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)"
                                            }}>
                                            {stage.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 flex items-center gap-8 border-b border-gray-50 h-14 overflow-x-auto no-scrollbar">
                            {[
                                { id: "Activities", icon: Clock },
                                { id: "Notes", icon: FileText },
                                { id: "Calls", icon: Phone },
                                { id: "Files", icon: Paperclip },
                                { id: "Email", icon: Mail }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 h-full text-xs font-bold transition-all relative border-b-2
                                        ${activeTab === tab.id ? "text-red-600 border-red-600" : "text-gray-400 border-transparent hover:text-gray-600"}
                                    `}
                                >
                                    <tab.icon size={14} />
                                    {tab.id}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === "Activities" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-black text-gray-900">Activities</h4>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all">
                                            <List size={14} className="text-gray-400" />
                                            Sort By
                                            <ChevronRight size={12} className="rotate-90 opacity-50" />
                                        </button>
                                    </div>

                                    {/* Activity Timeline */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 bg-blue-50 w-fit px-2 py-0.5 rounded uppercase">
                                            <Calendar size={10} />
                                            28 May 2025
                                        </div>
                                        <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start gap-4 hover:border-blue-100 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-100">
                                                <Mail size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-800">You sent 1 Message to the contact.</p>
                                                <p className="text-[10px] text-gray-400 font-medium">10:25 pm</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Notes" && (
                                <div className="space-y-4">
                                    <h4 className="text-base font-black text-gray-900">Notes</h4>
                                    <div className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 italic leading-relaxed">
                                        {deal.notes || "No interaction notes recorded for this deal."}
                                    </div>
                                </div>
                            )}

                            {(activeTab === "Calls" || activeTab === "Files" || activeTab === "Email") && (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-3">
                                    <div className="p-4 bg-gray-50 rounded-full">
                                        {activeTab === "Calls" ? <Phone size={32} /> : activeTab === "Files" ? <Paperclip size={32} /> : <Mail size={32} />}
                                    </div>
                                    <p className="text-sm font-bold">No {activeTab} recorded</p>
                                    <p className="text-xs">Start by adding a new {activeTab.slice(0, -1).toLowerCase()} to this deal.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
