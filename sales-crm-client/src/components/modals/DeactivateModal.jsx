import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { toast } from "react-hot-toast";

const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

const baseInput = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white transition";
const inputClass = (err) => err
    ? `${baseInput} border-red-400 focus:ring-red-200 bg-red-50`
    : `${baseInput} border-gray-200 focus:ring-purple-400`;

export default function DeactivateModal({ isOpen, onClose, user, activeUsers, onConfirm }) {
    const [newOwnerId, setNewOwnerId] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (isOpen) setNewOwnerId(""); }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newOwnerId) { toast.error("Please select a new owner"); return; }
        setSaving(true);
        try {
            await onConfirm(newOwnerId);
            onClose();
        } catch (err) {
            // Error typically handled by onConfirm or toast
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !user) return null;

    // Filter active users: 
    // - Not the user being deactivated
    // - Must be active
    // - For managers, they usually reassign within their team or to themselves. 
    // - The activeUsers list passed should already be filtered by the parent if needed.
    const opts = activeUsers.filter(u => u._id !== user._id && u.isActive && u.role !== "admin");

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deactivate User & Reassign Records">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
                    <p className="font-semibold mb-1 uppercase tracking-tight text-xs">⚠️ Mandatory Record Transfer</p>
                    <p>Deactivating <span className="font-bold">{user.firstName} {user.lastName}</span> requires transferring all their records (Companies, Contacts & Deals) to another user.</p>
                </div>

                <Field label="Reassign all records to *">
                    <select
                        value={newOwnerId}
                        onChange={e => setNewOwnerId(e.target.value)}
                        className={`${inputClass(false)} w-full border rounded-full border-slate-200 px-4 py-2 text-center bg-white`}
                        required
                    >
                        <option value="">— Select New Owner —</option>
                        {opts.map(u => (
                            <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role.replace(/_/g, " ")})</option>
                        ))}
                    </select>
                </Field>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving || !newOwnerId}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition">
                        {saving ? "Processing..." : "Deactivate & Reassign"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
