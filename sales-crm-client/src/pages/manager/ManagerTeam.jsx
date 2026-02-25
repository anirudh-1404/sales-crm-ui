import React, { useState, useEffect } from "react";
import { getTeamUsers, deactivateUser, activateUser } from "../../../API/services/userService";
import UserModal from "../../components/modals/UserModal";
import DeactivateModal from "../../components/modals/DeactivateModal";
import { Plus, Users2, CheckCircle2, XCircle, UserCheck, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
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

const Avatar = ({ name }) => {
    if (!name) return null;
    const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
    return (
        <div className={`w-9 h-9 rounded-full ${colors[name.charCodeAt(0) % colors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
};

const roleBadge = {
    sales_manager: "bg-purple-100 text-purple-700",
    sales_rep: "bg-blue-100 text-blue-700",
};

export default function ManagerTeam() {
    const { user: currentUser } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", confirmColor: "", onConfirm: null });
    const openConfirm = (opts) => setConfirmState({ isOpen: true, ...opts });
    const closeConfirm = () => setConfirmState(s => ({ ...s, isOpen: false }));

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const res = await getTeamUsers();
            setMembers(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load team");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleToggleActive = (member) => {
        if (!member.isActive) {
            handleActivate(member);
            return;
        }
        setSelectedMember(member);
        setIsDeactivateModalOpen(true);
    };

    const handleActivate = (member) => {
        openConfirm({
            title: "Activate Member?",
            message: `Are you sure you want to reactivate ${member.firstName} ${member.lastName}? They will be able to log in again.`,
            confirmLabel: "Activate",
            confirmColor: "bg-green-600 hover:bg-green-700",
            onConfirm: async () => {
                try {
                    await activateUser(member._id);
                    toast.success(`${member.firstName} reactivated`);
                    fetchTeam();
                } catch (error) {
                    console.error(error);
                    toast.error(error.response?.data?.message || "Failed to activate user");
                }
            }
        });
    };

    const confirmDeactivate = async (newOwnerId) => {
        try {
            const body = newOwnerId ? { newOwnerId } : {};
            await deactivateUser(selectedMember._id, body);
            const msg = newOwnerId
                ? `${selectedMember.firstName} deactivated and records reassigned`
                : `${selectedMember.firstName} deactivated (data kept with user)`;
            toast.success(msg);
            fetchTeam();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to deactivate user");
            throw error;
        }
    };

    const filtered = members.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    const repsOnly = members.filter(m => m.role === "sales_rep");
    const activeCount = members.filter(m => m.isActive).length;
    const inactiveCount = members.filter(m => !m.isActive).length;

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Team</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">View your team members and their activity</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow-md shadow-purple-100"
                >
                    <Plus size={18} />
                    <span>Add Member</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Members", value: loading ? "..." : String(members.length), color: "bg-purple-50 text-purple-600", icon: Users2 },
                    { label: "Active", value: loading ? "..." : String(activeCount), color: "bg-green-50 text-green-600", icon: CheckCircle2 },
                    { label: "Inactive", value: loading ? "..." : String(inactiveCount), color: "bg-red-50 text-red-500", icon: XCircle },
                    { label: "Sales Reps", value: loading ? "..." : String(repsOnly.length), color: "bg-blue-50 text-blue-600", icon: UserCheck },
                ].map(s => (
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
                    <h2 className="font-bold text-gray-800">Team Members</h2>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search member..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full sm:w-64 text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50/50" />
                    </div>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {["Member", "Role", "Reports To", "Status", "Last Login", "Action"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading team...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No members found.</td></tr>
                            ) : (
                                filtered.map((m) => (
                                    <tr key={m._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={`${m.firstName} ${m.lastName}`} />
                                                <div>
                                                    <p className="font-medium text-gray-800 leading-none">{m.firstName} {m.lastName}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{m.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleBadge[m.role] || "bg-red-100 text-red-700"}`}>
                                                {m.role?.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                                            {m.managerId ? `${m.managerId.firstName || "Manager"} ${m.managerId.lastName || ""}`.trim() : "—"}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                                {m.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                            {m.lastLogin ? new Date(m.lastLogin).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never"}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {m.role === "sales_rep" ? (
                                                <button
                                                    onClick={() => handleToggleActive(m)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${m.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                                                >
                                                    {m.isActive ? "Deactivate" : "Activate"}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={fetchTeam}
                restrictedRole="sales_rep"
                fixedManagerId={currentUser?.id}
            />

            <DeactivateModal
                isOpen={isDeactivateModalOpen}
                onClose={() => setIsDeactivateModalOpen(false)}
                user={selectedMember}
                activeUsers={members}
                onConfirm={confirmDeactivate}
            />
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmLabel={confirmState.confirmLabel}
                confirmColor={confirmState.confirmColor}
            />
        </div>
    );
}
