import React, { useState, useEffect } from "react";
import Modal from "./Modal";

export default function ContactModal({ isOpen, onClose, contact, onSave, companies }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+\d\s\-()]{7,15}$/;

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", jobTitle: "",
        companyId: "", phone: "", mobile: "", linkedin: "", notes: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contact) {
            setFormData({
                firstName: contact.firstName || "",
                lastName: contact.lastName || "",
                email: contact.email || "",
                jobTitle: contact.jobTitle || "",
                companyId: contact.companyId?._id || contact.companyId || "",
                phone: contact.phone || "",
                mobile: contact.mobile || "",
                linkedin: contact.linkedin || "",
                notes: contact.notes || ""
            });
        } else {
            setFormData({ firstName: "", lastName: "", email: "", jobTitle: "", companyId: "", phone: "", mobile: "", linkedin: "", notes: "" });
        }
        setErrors({});
    }, [contact, isOpen]);

    const set = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.firstName.trim()) errs.firstName = "First name is required";
        else if (formData.firstName.trim().length < 2) errs.firstName = "First name must be at least 2 characters";
        if (!formData.lastName.trim()) errs.lastName = "Last name is required";
        else if (formData.lastName.trim().length < 2) errs.lastName = "Last name must be at least 2 characters";
        if (!formData.email.trim()) errs.email = "Email is required";
        else if (!emailRegex.test(formData.email.trim())) errs.email = "Enter a valid email address";
        if (!formData.companyId) errs.companyId = "Please select a company";
        if (formData.phone && !phoneRegex.test(formData.phone)) errs.phone = "Enter a valid phone number";
        if (formData.mobile && !phoneRegex.test(formData.mobile)) errs.mobile = "Enter a valid mobile number";
        if (formData.linkedin && !formData.linkedin.includes("linkedin.com")) errs.linkedin = "Enter a valid LinkedIn URL";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 transition ${errors[field]
            ? "border-red-400 focus:ring-red-200 bg-red-50"
            : "border-gray-200 focus:ring-purple-400"
        }`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={contact ? "Edit Contact" : "Create New Contact"}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">First Name *</label>
                        <input type="text" className={inputClass("firstName")} value={formData.firstName}
                            onChange={e => set("firstName", e.target.value)} placeholder="John" />
                        {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Last Name *</label>
                        <input type="text" className={inputClass("lastName")} value={formData.lastName}
                            onChange={e => set("lastName", e.target.value)} placeholder="Doe" />
                        {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email Address *</label>
                    <input type="email" className={inputClass("email")} value={formData.email}
                        onChange={e => set("email", e.target.value)} placeholder="john.doe@company.com" />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Job Title</label>
                        <input type="text" className={inputClass("jobTitle")} value={formData.jobTitle}
                            onChange={e => set("jobTitle", e.target.value)} placeholder="Sales Director" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Company *</label>
                        <select className={inputClass("companyId") + " bg-white"} value={formData.companyId}
                            onChange={e => set("companyId", e.target.value)}>
                            <option value="">Select Company</option>
                            {companies?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        {errors.companyId && <p className="text-red-500 text-xs">{errors.companyId}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                        <input type="text" className={inputClass("phone")} value={formData.phone}
                            onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Mobile</label>
                        <input type="text" className={inputClass("mobile")} value={formData.mobile}
                            onChange={e => set("mobile", e.target.value)} placeholder="+91 98765 43210" />
                        {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile}</p>}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">LinkedIn URL</label>
                    <input type="text" className={inputClass("linkedin")} value={formData.linkedin}
                        onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/johndoe" />
                    {errors.linkedin && <p className="text-red-500 text-xs">{errors.linkedin}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Notes</label>
                    <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 h-20"
                        value={formData.notes} onChange={e => set("notes", e.target.value)}
                        placeholder="Additional details..." />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-md shadow-purple-200 transition disabled:opacity-50">
                        {loading ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
