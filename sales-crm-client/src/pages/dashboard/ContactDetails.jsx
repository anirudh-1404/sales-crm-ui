```
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getContactById } from "../../../API/services/contactService";
import {
    User, Mail, Phone, Smartphone, Linkedin,
    Building2, Briefcase, Calendar, Clock,
    ArrowLeft, ChevronRight, Download, RotateCw,
    Maximize2, Star, Shield, List, History,
    MessageSquare, FileText, Paperclip, Loader2,
    MapPin, Globe, ExternalLink, MoreHorizontal
} from "lucide-react";
import toast from "react-hot-toast";

const lifecycleStages = [
    { id: "Added", label: "Added" },
    { id: "Interested", label: "Interested" },
    { id: "Contacted", label: "Contacted" },
    { id: "Qualified", label: "Qualified" },
    { id: "Active", label: "Active" }
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

export default function ContactDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Activities");

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

    const getInitials = (firstName, lastName) => {
        return (
            (firstName?.[0] || "") + (lastName?.[0] || "")
        ).toUpperCase() || "C";
    };

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
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className="font-bold text-gray-900">Contacts</span>
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">42</span>
                        <ChevronRight size={14} className="text-gray-300" />
                        <Link to="/dashboard" className="hover:text-red-600">Home</Link>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-400">Contacts</span>
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

            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-4">
                <ArrowLeft size={18} />
                Back to Contacts
            </button>

            {/* Hero Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-red-600 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-black ring-1 ring-red-100 uppercase">
                        {getInitials(contact.firstName, contact.lastName)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-gray-900 leading-none">{contact.firstName} {contact.lastName}</h1>
                            <Star size={18} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <Briefcase size={14} className="text-gray-300" />
                                <span>{contact.jobTitle}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-red-500">
                                <Building2 size={12} className="text-red-400" />
                                <button
                                    onClick={() => contact.companyId?._id && navigate(`/ dashboard / companies / ${ contact.companyId._id } `)}
                                    className="hover:underline font-bold"
                                >
                                    {contact.companyId?.name || contact.companyName || "No Company"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-gray-100">
                        <Shield size={12} className="text-red-400" />
                        Resource Contact
                    </span>
                    <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">+2</div>
                    </div>
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Information */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Contact Channels</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Mail size={10} className="text-red-400" /> Email
                                </label>
                                <p className="text-sm font-bold text-gray-900 truncate">{contact.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Phone size={10} className="text-red-400" /> Phone
                                </label>
                                <p className="text-sm font-bold text-gray-900">{contact.phone || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Smartphone size={10} className="text-red-400" /> Mobile
                                </label>
                                <p className="text-sm font-bold text-gray-900">{contact.mobile || "—"}</p>
                            </div>
                            <div className="space-y-1 pt-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Linkedin size={10} className="text-blue-500" /> LinkedIn
                                </label>
                                {contact.linkedin ? (
                                    <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                                        View Profile < ExternalLink size = { 10} />
                                    </a >
                                ) : (
    <p className="text-sm font-bold text-gray-300 italic">Not available</p>
)}
                            </div >
                        </div >
                    </div >

    {/* Relationship Owner */ }
    < div className = "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" >
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Relationship Owner</h3>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-4 bg-red-50/30 p-4 rounded-xl border border-red-50">
                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm ring-1 ring-red-100">
                                    {contact.ownerId?.firstName?.[0]}{contact.ownerId?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 leading-none">{contact.ownerId?.firstName} {contact.ownerId?.lastName || "Not Assigned"}</p>
                                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tighter">Assigned Manager</p>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >

    {/* Right Column - Pipeline & Interactions */ }
    < div className = "lg:col-span-8 space-y-8" >
        {/* Pipeline Status */ }
        < div className = "space-y-4" >
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Contact Lifecycle Status</h3>
                        <div className="flex flex-wrap items-center">
                            {lifecycleStages.map((stage, index) => {
                                const isActive = index <= 2; // Hardcoded active for visual demo following the pattern
                                return (
                                    <div key={stage.id} className="flex-1 min-w-[120px] relative group h-10 mb-2 mr-2">
                                        <div className={`
                                            h-full w-full flex items-center justify-center text-[10px] font-bold px-4
                                            transition-all duration-300 cursor-default
                                            ${isActive
                                                ? (index === 0 ? "bg-blue-600 text-white" : index === 1 ? "bg-amber-400 text-white" : index === 2 ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-500")
                                                : "bg-gray-100 text-gray-400"}
                                            ${index === 0 ? "rounded-l-lg" : ""}
                                            ${index === lifecycleStages.length - 1 ? "rounded-r-lg" : ""}
                                            relative z-10
                                        `}
                                            style={{
                                                clipPath: index === 0
                                                    ? "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)"
                                                    : index === lifecycleStages.length - 1
                                                        ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10% 50%)"
                                                        : "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)"
                                            }}>
                                            {stage.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div >

    {/* Tabs Section */ }
    < div className = "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" >
        <div className="px-6 flex items-center gap-8 border-b border-gray-50 h-14 overflow-x-auto no-scrollbar">
            {[
                { id: "Activities", icon: Clock },
                { id: "Notes", icon: FileText },
                { id: "Tasks", icon: List },
                { id: "Files", icon: Paperclip },
                { id: "Emails", icon: Mail }
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

{/* Tab Content */ }
<div className="p-6">
    {activeTab === "Activities" && (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-gray-900">Recent Interactions</h4>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all">
                    <List size={14} className="text-gray-400" />
                    Filter
                </button>
            </div>

            {/* Activity Feed */}
            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border-2 border-white shadow-sm z-10">
                        <Mail size={18} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-800">Email sent regarding upcoming meeting</p>
                        <p className="text-[10px] text-gray-400 font-medium">{formatDate(contact.updatedAt, true)}</p>
                    </div>
                </div>
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center border-2 border-white shadow-sm z-10">
                        <User size={18} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-800">Contact profile updated by system</p>
                        <p className="text-[10px] text-gray-400 font-medium">{formatDate(contact.createdAt, true)}</p>
                    </div>
                </div>
            </div>
        </div>
    )}

    {activeTab === "Notes" && (
        <div className="space-y-4">
            <h4 className="text-base font-black text-gray-900">Personal Intelligence</h4>
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                {contact.notes || "No interaction notes recorded for this contact."}
            </div>
        </div>
    )}

    {/* Placeholders for others */}
    {["Tasks", "Files", "Emails"].includes(activeTab) && (
        <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                {activeTab === "Tasks" ? <List size={30} /> : activeTab === "Files" ? <Paperclip size={30} /> : <Mail size={30} />}
            </div>
            <p className="text-sm font-bold text-gray-400">Vault reaches here</p>
            <p className="text-xs text-gray-300 mt-1">No {activeTab} linked to this profile yet.</p>
        </div>
    )}
</div>
                    </div >
                </div >
            </div >

    {/* Sticky Meta Footer */ }
    < div className = "flex items-center justify-between pt-6 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest" >
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5"><History size={12} className="text-gray-300" /> Registry: {formatDate(contact.createdAt)}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> Synchronization: {formatDate(contact.updatedAt)}</span>
                </div>
                <span>Ref: {contact._id}</span>
            </div >
        </div >
    );
}
