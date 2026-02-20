import { Company } from "../models/companySchema.js";
import User from "../models/userSchema.js";

export const createCompany = async (req, res) => {
    try {
        const {
            name,
            industry,
            size,
            website,
            primaryContact,
            status,
            address,
            phone,
            revenueRange,
            notes
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Company name is required!"
            });
        }

        const company = await Company.create({
            name,
            industry,
            size,
            website,
            primaryContact,
            status,
            address,
            phone,
            revenueRange,
            notes,
            ownerId: req.user.id
        });

        return res.status(201).json({
            message: "Company created successfully!",
            data: company
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        });
    }
};

export const getCompanies = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { name, industry, status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        let filter = {};

        if (name) filter.name = { $regex: name, $options: "i" };
        if (industry) filter.industry = industry;
        if (status) filter.status = status;

        if (role === "sales_manager") {
            const teamUsers = await User.find({
                $or: [{ _id: id }, { managerId: id }]
            }).select("_id");

            const teamIds = teamUsers.map(u => u._id);
            filter.ownerId = { $in: teamIds };
        }

        if (role === "sales_rep") {
            filter.ownerId = id;
        }


        //pagination
        const skip = (page - 1) * limit;

        const companies = await Company.find(filter)
            .populate("ownerId", "firstName email")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Company.countDocuments(filter);

        return res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            data: companies
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found!"
            });
        }

        if (role !== "admin") {

            if (role === "sales_manager") {
                const teamUsers = await User.find({
                    $or: [{ _id: userId }, { managerId: userId }]
                }).select("_id");

                const teamIds = teamUsers.map(u => u._id.toString());

                if (!teamIds.includes(company.ownerId.toString())) {
                    return res.status(403).json({
                        message: "Access denied!"
                    });
                }
            }

            if (role === "sales_rep") {
                if (company.ownerId.toString() !== userId) {
                    return res.status(403).json({
                        message: "Access denied!"
                    });
                }
            }
        }

        const fields = [
            "name",
            "industry",
            "size",
            "website",
            "primaryContact",
            "status",
            "address",
            "phone",
            "revenueRange",
            "notes"
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                company[field] = req.body[field];
            }
        });

        await company.save();

        return res.json({
            message: "Company updated successfully!",
            data: company
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found!"
            });
        }

        if (role !== "admin") {

            if (role === "sales_manager") {
                const teamUsers = await User.find({
                    $or: [{ _id: userId }, { managerId: userId }]
                }).select("_id");

                const teamIds = teamUsers.map(u => u._id.toString());

                if (!teamIds.includes(company.ownerId.toString())) {
                    return res.status(403).json({
                        message: "Access denied!"
                    });
                }
            }

            if (role === "sales_rep") {
                if (company.ownerId.toString() !== userId) {
                    return res.status(403).json({
                        message: "Access denied!"
                    });
                }
            }
        }

        await company.deleteOne();

        return res.json({
            message: "Company deleted successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        });
    }
};

export const changeOwnership = async (req, res) => {
    try {
        const { id } = req.params;
        const { newOwnerId } = req.body;
        const { role, id: userId } = req.user;

        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found!"
            });
        }

        if (role === "sales_rep") {
            return res.status(403).json({
                message: "Access denied!"
            });
        }

        if (role === "sales_manager") {
            const teamUsers = await User.find({
                $or: [{ _id: userId }, { managerId: userId }]
            }).select("_id");

            const teamIds = teamUsers.map(u => u._id.toString());

            if (!teamIds.includes(newOwnerId)) {
                return res.status(403).json({
                    message: "New owner must belong to your team!"
                });
            }
        }

        company.ownerId = newOwnerId;
        await company.save();

        return res.json({
            message: "Ownership changed successfully!",
            data: company
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        });
    }
};
