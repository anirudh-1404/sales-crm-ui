import React, { useState, useEffect } from "react";
import { Users, Building2, Users2, ChevronDown, Plus, Edit2, Trash2, Search } from "lucide-react";
import { getContacts, createContact, updateContact, deleteContact } from "../../../API/services/contactService";
import { getCompanies } from "../../../API/services/companyService";
import ContactModal from "../../components/modals/ContactModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import { toast } from "react-hot-toast";

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ title, children }) => (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
        <div className="flex items-center gap-2">{children}</div>
    </div>
);

const Select = ({ options, value, onChange }) => (
    <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
            className="appearance-none text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 hover:border-gray-300 transition">
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const Avatar = ({ name }) => {
    if (!name) return null;
    const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
    return (
        <div className={`w-8 h-8 rounded-full ${colors[name.charCodeAt(0) % colors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
};

export default function ManagerContacts() {
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal states
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contactsRes, companiesRes] = await Promise.all([
                getContacts({ name: search || undefined, limit: 100 }),
                getCompanies({ limit: 1000 })
            ]);
            setContacts(contactsRes.data.data);
            setCompanies(companiesRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSaveContact = async (formData) => {
        try {
            if (selectedContact) {
                await updateContact(selectedContact._id, formData);
                toast.success("Contact updated successfully");
            } else {
                await createContact(formData);
                toast.success("Contact created successfully");
            }
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save contact");
            throw error;
        }
    };

    const handleDeleteContact = async () => {
        if (!selectedContact) return;
        try {
            await deleteContact(selectedContact._id);
            toast.success("Contact deleted successfully");
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete contact");
        }
    };

    const stats = [
        { label: "Team Contacts", value: String(contacts.length), color: "bg-purple-50 text-purple-600", icon: Users },
        { label: "Linked to Company", value: String(contacts.filter(c => c.companyId).length), color: "bg-green-50 text-green-600", icon: Building2 },
        { label: "Total Active", value: String(contacts.length), color: "bg-blue-50 text-blue-600", icon: Users2 },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Team Contacts</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Manage and view contacts across your entire team</p>
                </div>
                <button
                    onClick={() => { setSelectedContact(null); setIsContactModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-100"
                >
                    <Plus size={18} />
                    <span>Create Contact</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-snug">{s.value}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Card>
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <h3 className="font-semibold text-gray-800 text-base">All Team Contacts</h3>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search contact..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full sm:w-64 text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50/50 transition-all font-medium" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {["Contact", "Job Title", "Company", "Owner", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && contacts.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading contacts...</td></tr>
                            ) : contacts.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No contacts found.</td></tr>
                            ) : (
                                contacts.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={`${c.firstName} ${c.lastName}`} />
                                                <div>
                                                    <p className="font-medium text-gray-800 leading-none">{c.firstName} {c.lastName}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{c.jobTitle || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{c.companyId?.name || "—"}</span>
                                        </td>
                                        <td className="px-4 py-3 text-purple-700 font-medium">{c.ownerId?.firstName || "Unknown"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedContact(c); setIsContactModalOpen(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedContact(c); setIsDeleteModalOpen(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                contact={selectedContact}
                onSave={handleSaveContact}
                companies={companies}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteContact}
                itemName={`${selectedContact?.firstName} ${selectedContact?.lastName}`}
            />
        </div>
    );
}
