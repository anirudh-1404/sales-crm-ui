import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDealById } from "../../../API/services/dealService";
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

    const getInitials = (name) => {
        if (!name) return "D";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${stageBadge[deal.stage] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {deal.stage}
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-sm ring-1 ring-gray-100 uppercase">
                        {getInitials(deal.name)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{deal.name}</h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    {/* Basic Info */}
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-gray-400 block mb-1">Company</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Building2 size={16} className="text-red-400" />
                                <button
                                    onClick={() => deal.companyId?._id && navigate(`/dashboard/companies/${deal.companyId._id}`)}
                                    className="hover:text-red-600 Transition-colors"
                                >
                                    {deal.companyId?.name || deal.companyName || "N/A"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Contact</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <User size={16} className="text-red-400" />
                                <button
                                    onClick={() => deal.contactId?._id && navigate(`/dashboard/contacts/${deal.contactId._id}`)}
                                    className="hover:text-red-600 transition-colors"
                                >
                                    {deal.contactId ? `${deal.contactId.firstName} ${deal.contactId.lastName}` : (deal.contactName || "N/A")}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Expected Close Date</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Calendar size={16} className="text-red-400" />
                                {formatDate(deal.expectedCloseDate)}
                            </div>
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-gray-400 block mb-1">Value</label>
                            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <DollarSign size={18} className="text-green-500" />
                                {deal.currency} {deal.value?.toLocaleString() || "0"}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Probability</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full transition-all duration-500"
                                        style={{ width: `${deal.probability || 0}%` }}
                                    ></div>
                                </div>
                                <span className="font-bold text-gray-700">{deal.probability || 0}%</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Source</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900 capitalize">
                                <Info size={16} className="text-red-400" />
                                {deal.source || "N/A"}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="md:col-span-2 pt-4 border-t border-gray-50">
                        <label className="text-gray-400 text-sm block mb-2">Notes</label>
                        <div className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                            {deal.notes || "No additional notes provided."}
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-50 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock size={12} /> Created: {formatDate(deal.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> Updated: {formatDate(deal.updatedAt)}</span>
                    </div>
                    <span className="uppercase tracking-wider">ID: {deal._id}</span>
                </div>
            </div>
        </div>
    );
}
