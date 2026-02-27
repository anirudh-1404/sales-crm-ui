import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContactById } from "../../../API/services/contactService";
import {
    ContactRound, Building2, User, Phone,
    Mail, Linkedin, MapPin, Calendar,
    ArrowLeft, Info, Loader2, Share2,
    Briefcase, Shield, History, MessageSquare, Clock
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
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    <Shield size={12} className="text-red-400" /> Resource Contact
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-sm ring-1 ring-gray-100 uppercase">
                        {contact.firstName?.[0]?.toUpperCase()}{contact.lastName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
                        <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    {/* Professional Info */}
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-gray-400 block mb-1">Company</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Building2 size={16} className="text-red-400" />
                                <button
                                    onClick={() => contact.companyId?._id && navigate(`/dashboard/companies/${contact.companyId._id}`)}
                                    className="hover:text-red-600 transition-colors"
                                >
                                    {contact.companyId?.name || contact.companyName || "N/A"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">E-mail</label>
                            <div className="flex items-center gap-2 font-medium text-red-600 hover:underline">
                                <Mail size={16} className="text-red-400" />
                                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">LinkedIn</label>
                            <div className="flex items-center gap-2 font-medium text-blue-600 hover:underline">
                                <Linkedin size={16} className="text-red-400" />
                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">Profile Link</a>
                            </div>
                        </div>
                    </div>

                    {/* Personal / Communication */}
                    <div className="space-y-4 text-sm">
                        <div>
                            <label className="text-gray-400 block mb-1">Phone</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Phone size={16} className="text-red-400" />
                                {contact.phone || "N/A"}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Mobile</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <Phone size={16} className="text-red-400" />
                                {contact.mobile || "N/A"}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-400 block mb-1">Owner</label>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                <User size={16} className="text-red-400" />
                                {contact.ownerId?.firstName} {contact.ownerId?.lastName}
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="md:col-span-2 pt-4 border-t border-gray-50">
                        <label className="text-gray-400 text-sm block mb-2">Notes</label>
                        <div className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                            {contact.notes || "No additional notes."}
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-50 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><History size={12} /> Added: {formatDate(contact.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> Updated: {formatDate(contact.updatedAt)}</span>
                    </div>
                    <span className="uppercase tracking-wider">CID: {contact._id}</span>
                </div>
            </div>
        </div>
    );
}
