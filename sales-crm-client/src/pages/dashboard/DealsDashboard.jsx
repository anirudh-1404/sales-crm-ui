import React, { useState, useEffect } from "react";
import {
    Briefcase, Zap, CheckCircle2, DollarSign,
    MoreHorizontal, Plus, Edit2, Trash2
} from "lucide-react";
import { getDeals, createDeal, updateDeal, deleteDeal, updateDealStage } from "../../../API/services/dealService";
import { getCompanies } from "../../../API/services/companyService";
import { getContacts } from "../../../API/services/contactService";
import DealModal from "../../components/modals/DealModal";
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

const StatCard = ({ label, value, sub, color, icon: IconComp }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <IconComp size={20} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xs text-green-500 font-medium mt-0.5">{sub}</p>
        </div>
    </div>
);

const stageBadge = {
    Lead: "bg-blue-100 text-blue-700", Qualified: "bg-purple-100 text-purple-700",
    Proposal: "bg-yellow-100 text-yellow-700", Negotiation: "bg-orange-100 text-orange-700",
    "Closed Won": "bg-green-100 text-green-700", "Closed Lost": "bg-red-100 text-red-700",
};

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function DealsDashboard() {
    const [deals, setDeals] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isDealModalOpen, setIsDealModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dealsRes, companiesRes, contactsRes] = await Promise.all([
                getDeals({ limit: 100 }),
                getCompanies({ limit: 1000 }),
                getContacts({ limit: 1000 })
            ]);
            setDeals(dealsRes.data.data);
            setCompanies(companiesRes.data.data);
            setContacts(contactsRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const totalValue = deals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const wonCount = deals.filter(d => d.stage === "Closed Won").length;
    const activeCount = deals.filter(d => !d.stage.startsWith("Closed")).length;

    // Chart data simulation from real data
    const stageData = STAGES.map(s => ({
        stage: s,
        count: deals.filter(d => d.stage === s).length,
        color: stageBadge[s].split(' ')[0]
    }));

    return (
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Deals Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Global overview of all sales opportunities</p>
                </div>
                <button
                    onClick={() => { setSelectedDeal(null); setIsDealModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
                >
                    <Plus size={18} />
                    <span>Create Deal</span>
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Value" value={`₹${(totalValue / 100000).toFixed(2)}L`} sub="+12.5% vs last month" color="bg-indigo-50 text-indigo-600" icon={DollarSign} />
                <StatCard label="Active Deals" value={String(activeCount)} sub="15 pending" color="bg-blue-50 text-blue-600" icon={Zap} />
                <StatCard label="Won Deals" value={String(wonCount)} sub="82% win rate" color="bg-green-50 text-green-600" icon={CheckCircle2} />
                <StatCard label="New Deals" value={String(deals.length)} sub="This week" color="bg-purple-50 text-purple-600" icon={Briefcase} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardHeader title="All Recent Deals">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            <MoreHorizontal size={18} />
                        </button>
                    </CardHeader>
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {["Deal Name", "Owner", "Company", "Stage", "Value", "Actions"].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && deals.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading deals...</td></tr>
                                ) : deals.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No deals found in the system.</td></tr>
                                ) : (
                                    deals.slice(0, 10).map((d) => (
                                        <tr key={d._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                                            <td className="px-4 py-3 text-indigo-700 font-semibold">{d.ownerId?.firstName || "System"}</td>
                                            <td className="px-4 py-3 text-gray-500">{d.companyId?.name || "—"}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={d.stage}
                                                    onChange={e => handleMoveStage(d._id, e.target.value)}
                                                    className={`text-[11px] px-2 py-1 rounded-full font-bold border-none cursor-pointer focus:ring-0 ${stageBadge[d.stage]}`}
                                                >
                                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">₹{d.value?.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setSelectedDeal(d); setIsDealModalOpen(true); }}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
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
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader title="Deals by Stage" />
                    <div className="p-5 space-y-4">
                        {stageData.map(s => {
                            const total = deals.length || 1;
                            const pct = Math.round((s.count / total) * 100);
                            return (
                                <div key={s.stage}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 font-medium">{s.stage}</span>
                                        <span className="text-gray-500">{s.count} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${s.color.replace(' text-', ' bg-')} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-5 border-t border-gray-50 mt-auto">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <span>Win Probability</span>
                            <span className="font-bold text-green-600">72%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className="h-full bg-green-500 w-[72%] rounded-full" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            <DealModal
                isOpen={isDealModalOpen}
                onClose={() => setIsDealModalOpen(false)}
                deal={selectedDeal}
                onSave={handleSaveDeal}
                companies={companies}
                contacts={contacts}
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
