import { Contact } from "../models/contactSchema.js";
import { Deal } from "../models/dealSchema.js";
import User from "../models/userSchema.js";
import { Company } from "../models/companySchema.js";

export const createDeal = async (req, res, next) => {
    try {
        const { name, companyId, contactId, companyName, contactName, value, currency, stage, expectedCloseDate, probability, source, notes } = req.body;
        const { id: userId, role } = req.user;

        // Require name, some company ref, some contact ref, value and date
        if (!name || (!companyId && !companyName) || (!contactId && !contactName) || !value || !expectedCloseDate) {
            return res.status(400).json({ message: "All required fields must be filled!" });
        }

        let dealData = {
            name, value,
            currency: currency || "INR",
            stage: stage || "Lead",
            expectedCloseDate, probability, source, notes,
            ownerId: userId,
            stageHistory: [{ stage: stage || "Lead", changedBy: userId }]
        };

        if (companyId && contactId) {
            // ID-based flow — validate against DB
            const company = await Company.findById(companyId);
            if (!company) return res.status(404).json({ message: "Company not found!" });

            const contact = await Contact.findById(contactId);
            if (!contact) return res.status(404).json({ message: "Contact not found!" });

            if (contact.companyId.toString() !== companyId) {
                return res.status(400).json({ message: "Contact does not belong to this company!" });
            }

            if (role !== "admin") {
                if (role === "sales_manager") {
                    const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id");
                    const teamIds = teamUsers.map(u => u._id.toString());
                    if (!teamIds.includes(company.ownerId.toString())) {
                        return res.status(403).json({ message: "Access denied!" });
                    }
                }
                if (role === "sales_rep") {
                    if (company.ownerId.toString() !== userId) {
                        return res.status(403).json({ message: "Access denied!" });
                    }
                }
            }

            dealData.companyId = companyId;
            dealData.contactId = contactId;
        } else {
            // Free-text flow — store plain names (sales_rep)
            dealData.companyName = companyName;
            dealData.contactName = contactName;
        }

        const deal = await Deal.create(dealData);
        return res.status(201).json({ message: "Deal created successfully!", data: deal });

    } catch (error) {
        return res.status(500).json({ message: error.message || "Server error!" });
    }
}

export const updateDealInformation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.query;

        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                message: "Deal not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id")
                const teamIds = teamUsers.map(user => user._id.toString());
                if (!teamIds.includes(deal.ownerId.toString())) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }

            if (role === "sales_rep") {
                if (deal.ownerId.toString() !== userId) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }
        }

        if (req.body.stage) {
            return res.status(400).json({
                message: "Stage update not allowed here!"
            })
        }

        if (req.body.contactId && req.body.companyId) {
            const contact = await Contact.findById(req.body.contactId);

            if (!contact || contact.companyId.toString() !== req.body.companyId) {
                return res.status(400).json({
                    message: "Contact does not belong to this company!"
                })
            }
        }

        const fields = [
            "name",
            "companyId",
            "contactId",
            "value",
            "currency",
            "stage",
            "expectedCloseDate",
            "probability",
            "source",
            "notes"
        ]

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                deal[field] = req.body[field];
            }
        })

        await deal.save();

        return res.status(200).json({
            message: "Deal updated successfuly!",
            data: deal
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const moveDealStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;
        const { newStage } = req.body;

        const allowedStages = [
            "Lead",
            "Qualified",
            "Proposal",
            "Negotiation",
            "Closed Won",
            "Closed Lost"
        ]

        if (!newStage || !allowedStages.includes(newStage)) {
            return res.status(400).json({
                message: "Invalid Stage!"
            })
        }

        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                message: "Deal not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id");
                const teamIds = teamUsers.map(user => user._id.toString())

                if (!teamIds.includes(deal.ownerId.toString())) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }

            if (role === "sales_rep") {
                if (deal.ownerId.toString() !== userId) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }
        }

        if (deal.stage === newStage) {
            return res.status(400).json({
                message: "Deal is already in this stage!"
            })
        }

        //update
        deal.stage = newStage;

        deal.stageHistory.push({
            stage: newStage,
            changedBy: userId
        })

        await deal.save();

        return res.status(200).json({
            message: "Deal stage updated successfully!",
            data: deal
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

//mark deal as won or lost
export const markDealResult = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { result } = req.body;
        const { role, id: userId } = req.user

        const allowedResults = [
            "Closed Won",
            "Closed Lost"
        ]

        if (!allowedResults.includes(result)) {
            return res.status(400).json({
                message: "Invalid result!"
            })
        }

        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                message: "Deal not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id")
                const teamIds = teamUsers.map(user => user._id.toString());
                if (!teamIds.includes(deal.ownerId.toString())) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }

            if (role === "Sales_rep") {
                if (deal.ownerId.toString() !== userId) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }
        }

        if (deal.stage === "Closed Won" || deal.stage === "Closed Lost") {
            return res.status(400).json({
                message: "Deal already closed!"
            })
        }

        deal.stage = result;
        deal.probability = result === "Closed Won" ? 100 : 0

        deal.stageHistory.push({
            stage: result,
            changedBy: userId
        })

        await deal.save();

        return res.status(200).json({
            message: `Deal marked as ${result}`,
            data: deal
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const deleteDeal = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { role, id: userId } = req.user;

        const deal = await Deal.findById(id);

        if (!deal) {
            return res.status(404).json({
                message: "Deal not found!"
            })
        }

        if (role !== "admin") {
            if (role === "sales_manager") {
                const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id");
                const teamIds = teamUsers.map(user => user._id.toString());
                if (!teamIds.includes(deal.ownerId.toString())) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }
            if (role === "sales_rep") {
                if (deal.ownerId.toString() !== userId) {
                    return res.status(403).json({
                        message: "Access denied!"
                    })
                }
            }
        }

        await deal.deleteOne();

        return res.status(200).json({
            message: "Deal deleted successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const getDeals = async (req, res, next) => {
    try {
        const { role, id: userId } = req.user;
        const { name, stage, minValue, maxValue, startDate, endDate, owner, page = 1, limit = 10, sort = "-createdAt" } = req.query;

        let filter = {}

        if (name) filter.name = { $regex: name, $options: "i" };

        if (stage) {
            filter.stage = stage
        }

        if (minValue || maxValue) {
            filter.value = {};
            if (minValue) filter.value.$gte = Number(minValue)
            if (maxValue) filter.value.$lte = Number(maxValue)
        }
        if (startDate || endDate) {
            filter.expectedCloseDate = {};
            if (startDate) filter.expectedCloseDate.$gte = new Date(startDate);
            if (endDate) filter.expectedCloseDate.$lte = new Date(endDate);
        }

        if (owner && role === "admin") {
            filter.ownerId = owner;
        }
        if (role === "sales_manager") {
            const teamUsers = await User.find({ $or: [{ _id: userId }, { managerId: userId }] }).select("_id");
            const teamIds = teamUsers.map(user => user._id.toString());
            filter.ownerId = { $in: teamIds };
        }

        if (role === "sales_rep") {
            filter.ownerId = userId;
        }

        //pagination
        const skip = (page - 1) * limit;
        const deals = await Deal.find(filter).populate("ownerId", "firstName email").populate("companyId", "name industry").populate("contactId", "name email").sort(sort).skip(skip).limit(Number(limit));

        const total = await Deal.countDocuments(filter);

        return res.status(200).json({
            message: "Deals fetched successfully!",
            data: deals,
            total: Math.ceil(total / Number(limit)),
            page: Number(page),
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}