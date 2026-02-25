import React, { useState, useEffect } from "react";
import {
    Briefcase, Zap, CheckCircle2, DollarSign,
    MoreHorizontal, Plus, Edit2, Trash2,
    LayoutDashboard, Users, Building2, LayoutList, Kanban
} from "lucide-react";
import KanbanBoard from "../../components/KanbanBoard";
import { getDeals, createDeal, updateDeal, deleteDeal, updateDealStage } from "../../../API/services/dealService";
import { getCompanies } from "../../../API/services/companyService";
import { getContacts } from "../../../API/services/contactService";
import { getTeamUsers } from "../../../API/services/userService";
import { useAuth } from "../../context/AuthContext";
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
    const [users, setUsers] = useState([]);
    const { currentUser } = useAuth();

    // Modal states
    const [isDealModalOpen, setIsDealModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [viewMode, setViewMode] = useState("list"); // "list" | "kanban"

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dealsRes, companiesRes, contactsRes, usersRes] = await Promise.all([
                getDeals({ limit: 100 }),
                getCompanies({ limit: 1000 }),
                getContacts({ limit: 1000 }),
                getTeamUsers()
            ]);
            setDeals(dealsRes.data.data);
            setCompanies(companiesRes.data.data);
            setContacts(contactsRes.data.data);
            setUsers(usersRes.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dashboard data");
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
    const lostCount = deals.filter(d => d.stage === "Closed Lost").length;
    const activeCount = deals.filter(d => !d.stage.startsWith("Closed")).length;
    const winRate = Math.round((wonCount / (wonCount + lostCount || 1)) * 100);

    // Chart data simulation from real data
    const stageData = STAGES.map(s => ({
        stage: s,
        count: deals.filter(d => d.stage === s).length,
        color: stageBadge[s].split(' ')[0]
    }));

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Deals Dashboard</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Global overview of all sales opportunities</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("list")}
                            title="List View"
                            className={`p-1.5 rounded-md transition text-sm flex items-center gap-1.5 font-medium ${viewMode === "list"
                                    ? "bg-white text-gray-800 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <LayoutList size={16} />
                            <span className="hidden sm:inline text-xs">List</span>
                        </button>
                        <button
                            onClick={() => setViewMode("kanban")}
                            title="Kanban View"
                            className={`p-1.5 rounded-md transition text-sm flex items-center gap-1.5 font-medium ${viewMode === "kanban"
                                    ? "bg-white text-gray-800 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <Kanban size={16} />
                            <span className="hidden sm:inline text-xs">Kanban</span>
                        </button>
                    </div>
                    <button
                        onClick={() => { setSelectedDeal(null); setIsDealModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-md shadow-red-100"
                    >
                        <Plus size={18} />
                        <span>Create Deal</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Value" value={`$${totalValue >= 1000000 ? `${(totalValue / 1000000).toFixed(2)}M` : `${(totalValue / 1000).toFixed(1)}K`}`} sub="+12.5% vs last month" color="bg-indigo-50 text-indigo-600" icon={DollarSign} />
                <StatCard label="Active Deals" value={String(activeCount)} sub="15 pending" color="bg-blue-50 text-blue-600" icon={Zap} />
                <StatCard label="Won Deals" value={String(wonCount)} sub="82% win rate" color="bg-green-50 text-green-600" icon={CheckCircle2} />
                <StatCard label="New Deals" value={String(deals.length)} sub="This week" color="bg-purple-50 text-purple-600" icon={Briefcase} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Briefcase} label="Total Deals" value={deals.length} color="bg-blue-50 text-blue-600" />
                <StatCard icon={LayoutDashboard} label="Pipeline Value" value={`$${deals.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}`} color="bg-indigo-50 text-indigo-600" />
                <StatCard icon={Users} label="Active Owners" value={new Set(deals.map(d => d.ownerId?._id)).size} color="bg-purple-50 text-purple-600" />
                <StatCard icon={Building2} label="Companies" value={new Set(deals.map(d => d.companyId?._id)).size} color="bg-red-50 text-red-600" />
            </div>

            {/* Kanban Board View */}
            {viewMode === "kanban" && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-bold text-gray-800">Pipeline Board</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{deals.length} deals across all stages</p>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading pipeline...</div>
                    ) : (
                        <KanbanBoard
                            deals={deals}
                            onEdit={(d) => { setSelectedDeal(d); setIsDealModalOpen(true); }}
                            onDelete={(d) => { setSelectedDeal(d); setIsDeleteModalOpen(true); }}
                        />
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <Card className="lg:col-span-3 overflow-hidden">
                        <CardHeader title="All Recent Deals">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                <MoreHorizontal size={18} />
                            </button>
                        </CardHeader>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        {["Deal Name", "Owner", "Company", "Contact", "Stage", "Value", "Actions"].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading && deals.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading deals...</td></tr>
                                    ) : deals.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-10 text-gray-400">No deals found in the system.</td></tr>
                                    ) : (
                                        deals.slice(0, 10).map((d) => (
                                            <tr key={d._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{d.name}</td>
                                                <td className="px-4 py-3 text-indigo-700 font-semibold whitespace-nowrap">{d.ownerId?.firstName || "System"}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.companyId?.name || d.companyName || "—"}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.contactId ? `${d.contactId.firstName} ${d.contactId.lastName}`.trim() : (d.contactName || "—")}</td>
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
                                                <td className="px-4 py-3 whitespace-nowrap">
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
                                <span className="font-bold text-green-600">{winRate}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${winRate}%` }} />
                            </div>
                        </div>
                    </Card>
                </div>)}


            {/* Modals */}
            <DealModal
                isOpen={isDealModalOpen}
                onClose={() => setIsDealModalOpen(false)}
                deal={selectedDeal}
                onSave={handleSaveDeal}
                companies={companies}
                contacts={contacts}
                userRole={currentUser?.role}
                potentialOwners={users}
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
