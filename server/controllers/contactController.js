import { Company } from "../models/companySchema.js";
import { Contact } from "../models/contactSchema.js";
import User from "../models/userSchema.js";

export const createContact = async (req, res, next) => {
    try {
        const { firstName, lastName, email, jobTitle, companyId, phone, mobile, linkedin, notes } = req.body
        const { id, role } = req.user;

        if (!firstName || !lastName || !email || !jobTitle || !companyId) {
            return res.status(400).json({
                message: "All required fields must be filled!"
            })
        }

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                message: "Associated company not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: id }, { managerId: id }] }).select("_id");

                const teamIds = teamUsers.map(user => user._id.toString());

                if (!teamIds.includes(company.ownerId.toString())) {
                    return res.status(403).json({
                        message: "You can only add contacts to your team companies!"
                    })
                }
            }
        }

        if (role === "sales_rep") {
            if (company.ownerId.toString() !== id) {
                return res.status(403).json({
                    message: "You can only add contacts to your own companies!"
                })
            }
        }

        const contact = await Contact.create({
            firstName,
            lastName,
            email,
            jobTitle,
            companyId,
            ownerId: id,
            phone,
            mobile,
            linkedin,
            notes
        })

        return res.status(201).json({
            message: "Contact created successfully!",
            data: contact
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const getContacts = async (req, res, next) => {
    try {

        const { id, role } = req.user;
        const { name, company, jobTitle, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        let filter = {};
        if (name) {
            filter.$or = [
                { firstName: { $regex: name, $options: "i" } },
                { lastName: { $regex: name, $options: "i" } }
            ]
        }
        if (jobTitle) {
            filter.jobTitle = { $regex: jobTitle, $options: "i" }
        }
        if (company) {
            const companyDocs = await Company.findOne({ name: { $regex: company, $options: "i" } })
            if (companyDocs) {
                filter.companyId = companyDocs._id
            }
        }

        if (role === "sales_manager") {
            const teamUsers = await User.find({ $or: [{ _id: id }, { managerId: id }] }).select("_id");
            const teamIds = teamUsers.map(user => user._id.toString());
            filter.ownerId = { $in: teamIds }
        }

        if (role === "sales_rep") {
            filter.ownerId = id;
        }

        const skip = (page - 1) * limit;
        const contacts = await Contact.find(filter).populate("ownerId", 'firstName email').populate("companyId", "name industry").sort(sort).skip(skip).limit(Number(limit));

        const total = await Contact.countDocuments(filter);

        return res.status(200).json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            data: contacts
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const updateContact = async (req, res, next) => {
    try {

        const { id: userId, role } = req.user;
        const { id } = req.params;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id");
                const teamIds = teamUsers.map(user => user._id.toString());
                if (!teamIds.includes(contact.ownerId.toString())) {
                    return res.status(403).json({
                        message: "You can only update contacts of your team members!"
                    })
                }
            }
        }

        if (role === "sales_rep") {
            if (contact.ownerId.toString() !== userId) {
                return res.status(403).json({
                    message: "You can only update your own contacts!"
                })
            }
        }

        const fields = [
            "firstName",
            "lastName",
            "email",
            "jobTitle",
            "companyId",
            "ownerId",
            "phone",
            "mobile",
            "linkedin",
            "notes"
        ]

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                contact[field] = req.body[field]
            }
        })

        await contact.save();

        return res.status(200).json({
            message: "Contact updated successfully!",
            data: contact
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}


export const deleteContact = async (req, res, next) => {
    try {

        const { id: userId, role } = req.user;
        const { id } = req.params;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id");
                const teamIds = teamUsers.map(user => user._id.toString());
                if (!teamIds.includes(contact.ownerId.toString())) {
                    return res.status(403).json({
                        message: "You can only delete contacts of your team members!"
                    })
                }
            }
        }

        if (role === "sales_rep") {
            if (contact.ownerId.toString() !== userId) {
                return res.status(403).json({
                    message: "You can only delete your own contacts!"
                })
            }
        }

        await contact.deleteOne();

        return res.status(200).json({
            message: "Contact deleted successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}