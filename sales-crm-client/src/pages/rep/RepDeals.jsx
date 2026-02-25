import React, { useState, useEffect } from "react";
import { Briefcase, Zap, CheckCircle2, DollarSign, ChevronDown, Plus, Edit2, Trash2 } from "lucide-react";
import { getDeals, createDeal, updateDeal, deleteDeal, updateDealStage } from "../../../API/services/dealService";
import { getCompanies } from "../../../API/services/companyService";
import { getContacts } from "../../../API/services/contactService";
import DealModal from "../../components/modals/DealModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import { toast } from "react-hot-toast";

const Select = ({ options, value, onChange }) => (
    <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
            className="appearance-none text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 hover:border-gray-300 transition">
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ title, children }) => (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
        <div className="flex items-center gap-2">{children}</div>
    </div>
);

const stageBadge = {
    Lead: "bg-blue-100 text-blue-700", Qualified: "bg-purple-100 text-purple-700",
    Proposal: "bg-yellow-100 text-yellow-700", Negotiation: "bg-orange-100 text-orange-700",
    "Closed Won": "bg-green-100 text-green-700", "Closed Lost": "bg-red-100 text-red-700",
};

const stageOptions = ["All Stages", "Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function RepDeals() {
    const [deals, setDeals] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stageFilter, setStageFilter] = useState("All Stages");

    // Modal states
    const [isDealModalOpen, setIsDealModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dealsRes, companiesRes, contactsRes] = await Promise.all([
                getDeals({ stage: stageFilter === "All Stages" ? undefined : stageFilter }),
                getCompanies({ limit: 1000 }),
                getContacts({ limit: 1000 })
            ]);
            setDeals(dealsRes.data.data);
            setCompanies(companiesRes.data.data);
            setContacts(contactsRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [stageFilter]);

    const handleSaveDeal = async (formData) => {
        try {
            if (selectedDeal) {
                await updateDeal(selectedDeal._id, formData);
                toast.success("Deal updated successfully");
            } else {
                await createDeal(formData);
                toast.success("Deal created successfully");
            }
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save deal");
            throw error;
        }
    };

    const handleDeleteDeal = async () => {
        if (!selectedDeal) return;
        try {
            await deleteDeal(selectedDeal._id);
            toast.success("Deal deleted successfully");
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete deal");
        }
    };

    const handleMoveStage = async (id, newStage) => {
        try {
            await updateDealStage(id, newStage);
            toast.success(`Moved to ${newStage}`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to move stage");
        }
    };

    const activeDealsCount = deals.filter(d => !d.stage.startsWith("Closed")).length;
    const wonDealsCount = deals.filter(d => d.stage === "Closed Won").length;
    const pipelineValue = deals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const stats = [
        { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, color: "bg-green-50 text-green-600", icon: DollarSign },
        { label: "Active Deals", value: String(activeDealsCount), color: "bg-blue-50 text-blue-600", icon: Briefcase },
        { label: "Deals Won", value: String(wonDealsCount), color: "bg-purple-50 text-purple-600", icon: CheckCircle2 },
        { label: "Success Rate", value: "85%", color: "bg-orange-50 text-orange-600", icon: Zap },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Deals</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Manage and track your sales pipeline</p>
                </div>
                <button
                    onClick={() => { setSelectedDeal(null); setIsDealModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-md shadow-green-100"
                >
                    <Plus size={18} />
                    <span>New Deal</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-gray-800">My Pipeline</h2>
                    <div className="w-full sm:w-auto">
                        <Select options={stageOptions} value={stageFilter} onChange={setStageFilter} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {["Deal Name", "Company", "Contact", "Stage", "Value", "Expected Close", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && deals.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading deals...</td></tr>
                            ) : deals.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No deals found.</td></tr>
                            ) : (
                                deals.map((d) => (
                                    <tr key={d._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{d.name}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.companyId?.name || d.companyName || "—"}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.contactId ? `${d.contactId.firstName} ${d.contactId.lastName}` : (d.contactName || "—")}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={d.stage}
                                                onChange={e => handleMoveStage(d._id, e.target.value)}
                                                className={`text-[11px] px-2 py-1 rounded-full font-bold border-none cursor-pointer focus:ring-0 whitespace-nowrap ${stageBadge[d.stage]}`}
                                            >
                                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">${d.value?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : "—"}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedDeal(d); setIsDealModalOpen(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedDeal(d); setIsDeleteModalOpen(true); }}
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
            </div>

            {/* Modals */}
            <DealModal
                isOpen={isDealModalOpen}
                onClose={() => setIsDealModalOpen(false)}
                deal={selectedDeal}
                onSave={handleSaveDeal}
                companies={companies}
                contacts={contacts}
                freeText={true}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteDeal}
                itemName={selectedDeal?.name}
            />
        </div>
    );
}
