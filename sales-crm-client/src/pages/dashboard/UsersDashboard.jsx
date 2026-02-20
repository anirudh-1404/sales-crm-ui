import React, { useState, useEffect } from "react";
import { Users2, ShieldCheck, Briefcase, UserCheck, Edit2, RefreshCw, Plus, X } from "lucide-react";
import { getTeamUsers, createUser, updateUser, deactivateUser, activateUser, bulkReassignRecords } from "../../../API/services/userService";
import { toast } from "react-hot-toast";

// ─── Shared UI ────────────────────────────────────────────────
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
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-teal-500"];
    return (
        <div className={`w-9 h-9 rounded-full ${colors[name.charCodeAt(0) % colors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
};
const roleBadge = {
    admin: "bg-red-100 text-red-700",
    sales_manager: "bg-purple-100 text-purple-700",
    sales_rep: "bg-blue-100 text-blue-700",
};
const ModalOverlay = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(15,15,25,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);
const ModalHeader = ({ title, onClose }) => (
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
        </button>
    </div>
);
const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);
const baseInput = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white transition";
const inputClass = (err) => err
    ? `${baseInput} border-red-400 focus:ring-red-200 bg-red-50`
    : `${baseInput} border-gray-200 focus:ring-red-400`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Confirm Dialog ───────────────────────────────────────────
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", confirmColor = "bg-red-600 hover:bg-red-700" }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            style={{ background: "rgba(15,15,25,0.45)", backdropFilter: "blur(4px)" }}
            onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
                onClick={e => e.stopPropagation()}>
                {/* Icon */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ background: confirmColor.includes("green") ? "#dcfce7" : "#fee2e2" }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        strokeWidth={2} style={{ color: confirmColor.includes("green") ? "#16a34a" : "#dc2626" }}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                        Cancel
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition ${confirmColor}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── User Modal (Create + Edit) ────────────────────────────────
function UserModal({ isOpen, onClose, user, managers, onSaved }) {
    const isEdit = !!user;
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", password: "",
        role: "sales_rep", managerId: ""
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(isEdit
                ? { firstName: user.firstName, lastName: user.lastName, email: user.email, password: "", role: user.role, managerId: user.managerId?._id || user.managerId || "" }
                : { firstName: "", lastName: "", email: "", password: "", role: "sales_rep", managerId: "" }
            );
            setErrors({});
        }
    }, [isOpen, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = "First name is required";
        if (!form.lastName.trim()) errs.lastName = "Last name is required";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!emailRegex.test(form.email.trim())) errs.email = "Enter a valid email address";
        if (!isEdit) {
            if (!form.password) errs.password = "Password is required";
            else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        try {
            const payload = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                role: form.role,
                managerId: form.role === "sales_rep" ? form.managerId || null : null,
                ...(!isEdit && { password: form.password })
            };
            if (isEdit) {
                await updateUser(user._id, payload);
                toast.success("User updated successfully");
            } else {
                await createUser(payload);
                toast.success("User created successfully");
            }
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save user");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <ModalOverlay onClose={onClose}>
            <ModalHeader title={isEdit ? "Edit User" : "Add New User"} onClose={onClose} />
            <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange}
                            className={inputClass(errors.firstName)} placeholder="Jane" />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange}
                            className={inputClass(errors.lastName)} placeholder="Smith" />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                        className={inputClass(errors.email)} placeholder="jane@company.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                {!isEdit && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange}
                            className={inputClass(errors.password)} placeholder="Min. 6 characters" />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                )}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label>
                    <select name="role" value={form.role} onChange={handleChange} className={inputClass(false)}>
                        <option value="admin">Admin</option>
                        <option value="sales_manager">Sales Manager</option>
                        <option value="sales_rep">Sales Representative</option>
                    </select>
                </div>
                {form.role === "sales_rep" && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Reports To (Manager)</label>
                        <select name="managerId" value={form.managerId} onChange={handleChange} className={inputClass(false)}>
                            <option value="">— No Manager —</option>
                            {managers.map(m => (
                                <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition">
                        {saving ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ─── Reassign Modal ────────────────────────────────────────────
function ReassignModal({ isOpen, onClose, fromUser, activeUsers, onSaved }) {
    const [newOwnerId, setNewOwnerId] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (isOpen) setNewOwnerId(""); }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newOwnerId) { toast.error("Please select a new owner"); return; }
        setSaving(true);
        try {
            await bulkReassignRecords(fromUser._id, newOwnerId);
            toast.success("All records reassigned successfully");
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reassign records");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !fromUser) return null;
    const opts = activeUsers.filter(u => u._id !== fromUser._id && u.isActive);

    return (
        <ModalOverlay onClose={onClose}>
            <ModalHeader title="Bulk Reassign Records" onClose={onClose} />
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Reassigning all records</p>
                    <p>This will transfer <span className="font-bold">all companies, contacts & deals</span> owned by <span className="font-bold">{fromUser.firstName} {fromUser.lastName}</span> to the selected user.</p>
                </div>
                <Field label="Assign all records to *">
                    <select value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)} className={inputClass} required>
                        <option value="">— Select a user —</option>
                        {opts.map(u => (
                            <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role.replace(/_/g, " ")})</option>
                        ))}
                    </select>
                </Field>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-60 transition">
                        {saving ? "Reassigning..." : "Reassign All Records"}
                    </button>
                </div>
            </form>
        </ModalOverlay>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function UsersDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Confirm dialog state
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", confirmLabel: "", confirmColor: "", onConfirm: null });
    const openConfirm = (opts) => setConfirmState({ isOpen: true, ...opts });
    const closeConfirm = () => setConfirmState(s => ({ ...s, isOpen: false }));

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getTeamUsers();
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDeactivate = (user) => {
        if (!user.isActive) { toast.error("User is already inactive"); return; }
        openConfirm({
            title: "Deactivate User?",
            message: `Are you sure you want to deactivate ${user.firstName} ${user.lastName}? They will no longer be able to log in.`,
            confirmLabel: "Deactivate",
            confirmColor: "bg-red-600 hover:bg-red-700",
            onConfirm: async () => {
                try {
                    await deactivateUser(user._id);
                    toast.success(`${user.firstName} deactivated`);
                    fetchUsers();
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to deactivate user");
                }
            }
        });
    };

    const handleActivate = (user) => {
        if (user.isActive) { toast.error("User is already active"); return; }
        openConfirm({
            title: "Activate User?",
            message: `Are you sure you want to reactivate ${user.firstName} ${user.lastName}? They will be able to log in again.`,
            confirmLabel: "Activate",
            confirmColor: "bg-green-600 hover:bg-green-700",
            onConfirm: async () => {
                try {
                    await activateUser(user._id);
                    toast.success(`${user.firstName} reactivated`);
                    fetchUsers();
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to activate user");
                }
            }
        });
    };

    const managers = users.filter(u => u.role === "sales_manager" && u.isActive);
    const adminCount = users.filter(u => u.role === "admin").length;
    const managerCount = managers.length;
    const repCount = users.filter(u => u.role === "sales_rep").length;

    const filtered = users.filter(u => {
        const name = `${u.firstName} ${u.lastName}`.toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || u.email?.toLowerCase().includes(q) || u.role?.includes(q);
    });

    const roleBreakdown = [
        { role: "Admins", count: adminCount, color: "bg-red-500" },
        { role: "Sales Managers", count: managerCount, color: "bg-purple-500" },
        { role: "Sales Reps", count: repCount, color: "bg-blue-500" },
    ];

    return (
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Users Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage all users and their roles</p>
                </div>
                <button
                    onClick={() => { setSelectedUser(null); setIsUserModalOpen(true); }}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-md shadow-red-100"
                >
                    <Plus size={18} />
                    <span>Add User</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: loading ? "..." : String(users.length), color: "bg-blue-50 text-blue-600", icon: Users2 },
                    { label: "Admins", value: loading ? "..." : String(adminCount), color: "bg-red-50 text-red-600", icon: ShieldCheck },
                    { label: "Sales Managers", value: loading ? "..." : String(managerCount), color: "bg-purple-50 text-purple-600", icon: Briefcase },
                    { label: "Sales Reps", value: loading ? "..." : String(repCount), color: "bg-green-50 text-green-600", icon: UserCheck },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                            <p className="text-sm text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader title="All Users">
                    <input type="text" placeholder="Search users..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 w-48" />
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {["User", "Role", "Reports To", "Status", "Last Login", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading users...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found.</td></tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={`${u.firstName} ${u.lastName}`} />
                                                <div>
                                                    <p className="font-medium text-gray-800 leading-none">{u.firstName} {u.lastName}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleBadge[u.role] || "bg-gray-100 text-gray-600"}`}>
                                                {u.role?.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">
                                            {u.managerId
                                                ? `${u.managerId.firstName || ""} ${u.managerId.lastName || ""}`.trim() || "Manager"
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                                {u.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => { setSelectedUser(u); setIsUserModalOpen(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit user"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                {/* Reassign (only for non-admins) */}
                                                {u.role !== "admin" && (
                                                    <button
                                                        onClick={() => { setSelectedUser(u); setIsReassignModalOpen(true); }}
                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                        title="Reassign all records"
                                                    >
                                                        <RefreshCw size={15} />
                                                    </button>
                                                )}
                                                {/* Deactivate (active non-admins) */}
                                                {u.role !== "admin" && u.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivate(u)}
                                                        className="text-xs px-2.5 py-1 rounded-lg font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                                {/* Activate (inactive non-admins) */}
                                                {u.role !== "admin" && !u.isActive && (
                                                    <button
                                                        onClick={() => handleActivate(u)}
                                                        className="text-xs px-2.5 py-1 rounded-lg font-semibold border border-green-300 text-green-700 hover:bg-green-50 transition"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Role Breakdown */}
            <Card>
                <CardHeader title="Users by Role" />
                <div className="p-5 space-y-3">
                    {roleBreakdown.map(r => {
                        const total = users.length || 1;
                        const pct = Math.round((r.count / total) * 100);
                        return (
                            <div key={r.role}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 font-medium">{r.role}</span>
                                    <span className="text-gray-500">{r.count} ({pct}%)</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Modals */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                user={selectedUser}
                managers={managers}
                onSaved={fetchUsers}
            />
            <ReassignModal
                isOpen={isReassignModalOpen}
                onClose={() => setIsReassignModalOpen(false)}
                fromUser={selectedUser}
                activeUsers={users}
                onSaved={fetchUsers}
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
