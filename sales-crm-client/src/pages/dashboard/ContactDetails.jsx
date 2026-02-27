import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContactById } from "../../../API/services/contactService";
import {
    ContactRound, Building2, User, Phone,
    Mail, Linkedin, MapPin, Calendar,
    ArrowLeft, Info, Loader2, Share2,
    Briefcase, Shield, History, MessageSquare
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

export default function ContactDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await getContactById(id);
                setContact(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch contact details");
            } finally {
                setLoading(false);
            }
        };
        fetchContact();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-semibold">Contact not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
            </div>
        );
    }

    const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase() || "CN";
    const colors = ["bg-red-600", "bg-gray-800", "bg-red-500", "bg-gray-900", "bg-red-400"];
    const avatarColor = colors[(contact.firstName?.charCodeAt(0) || 0) % colors.length];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Minimal Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-widest">Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <button className="bg-white border-2 border-gray-900 text-gray-900 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
                        Connect Intelligence
                    </button>
                    <button className="bg-red-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95">
                        Modify Contact
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Identity Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 shadow-xl text-center space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-red-50 to-transparent"></div>
                        <div className="relative">
                            <div className={`w-36 h-36 rounded-[2.5rem] ${avatarColor} mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl border-8 border-white group-hover:rotate-3 transition-transform duration-500`}>
                                {initials}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                                {contact.firstName} {contact.lastName}
                            </h1>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 inline-block px-3 py-1 rounded-full">
                                {contact.jobTitle || "Liaison Officer"}
                            </p>
                        </div>
                        <div className="pt-4 flex justify-center gap-4">
                            {contact.linkedin && (
                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:scale-110 transition-transform">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            <a href={`mailto:${contact.email}`} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:scale-110 transition-transform">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="bg-gray-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Operational Links</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/dashboard/companies/${contact.companyId?._id}`)}>
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                    <Building2 size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight truncate">{contact.companyId?.name || "Independent"}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Associated Entity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                    <Shield size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight truncate">
                                        {`${contact.ownerId?.firstName || ""} ${contact.ownerId?.lastName || ""}`.trim() || "Unassigned"}
                                    </p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Record Custodian</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Intel Section */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Technical Contact Grid */}
                        <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 space-y-8 shadow-sm">
                            <h3 className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-widest">
                                <Phone size={20} className="text-red-500" /> Interaction Grid
                            </h3>
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Direct Primary</label>
                                    <p className="text-lg font-black text-gray-800 tracking-tight group-hover:text-red-500 transition-colors uppercase">
                                        {contact.phone || "No Registry Phone"}
                                    </p>
                                </div>
                                <div className="group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Mobile Mandate</label>
                                    <p className="text-lg font-black text-gray-800 tracking-tight group-hover:text-red-500 transition-colors uppercase">
                                        {contact.mobile || "Secure Line Only"}
                                    </p>
                                </div>
                                <div className="group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Security Mail</label>
                                    <p className="text-lg font-black text-gray-800 tracking-tight group-hover:text-red-500 transition-colors lowercase">
                                        {contact.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent History / Context */}
                        <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-100 flex flex-col shadow-sm">
                            <h3 className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                                <History size={20} className="text-red-500" /> Intel Logs
                            </h3>
                            <div className="flex-1 space-y-6 overflow-y-auto max-h-[300px] pr-4 custom-scrollbar font-black">
                                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border-l-4 border-red-500">
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-gray-900 uppercase leading-snug">Registration confirmed in master database system</p>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">{formatDate(contact.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border-l-4 border-gray-900">
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-gray-900 uppercase leading-snug">Last integrity check performed by system engine</p>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">{formatDate(contact.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Context / Notes */}
                    <div className="bg-white rounded-[3rem] border-2 border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b-2 border-gray-50 flex items-center justify-between">
                            <h3 className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
                                <MessageSquare size={22} className="text-red-500" /> Strategic Intelligence
                            </h3>
                            <Shield size={18} className="text-gray-300" />
                        </div>
                        <div className="p-10 text-gray-600 leading-[1.8] italic uppercase tracking-wider text-sm bg-gray-50/50 min-h-[150px]">
                            {contact.notes || "No additional strategic intelligence has been logged for this individual liaison."}
                        </div>
                    </div>

                    {/* Bottom Utility Tag */}
                    <div className="flex items-center justify-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] pt-4">
                        <span>Identity Lock</span>
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Reference {contact._id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
