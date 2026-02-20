import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/authToken.js";
import { comparePassword, hashedPassword } from "../utils/hashPassword.js";
import { Company } from "../models/companySchema.js";
import { Contact } from "../models/contactSchema.js";

export const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, managerId } = req.body;

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !role) {
            return res.status(400).json({
                message: "All required fields must be filled!"
            })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists!"
            })
        }

        const hashedPass = await hashedPassword(password)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPass,
            role,
            managerId: role === "sales_rep" ? managerId : null
        })

        const token = await generateToken(user._id, user.role)

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "User registered successfully!",
            data: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error"
        })
    }
}

export const loginUser = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if (!email.trim() || !password) {
            return res.status(400).json({
                message: "All required fields must be filled!"
            })
        }

        const user = await User.findOne({ email }).select("+password")

        if (!user || !user.isActive) {
            return res.status(404).json({
                message: "User does not exists!"
            })
        }

        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials!"
            })
        }

        const token = await generateToken(user._id, user.role)

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        user.lastLogin = Date.now()
        await user.save()

        res.status(200).json({
            message: "User logged in successfully!",
            data: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User does not exists!"
            })
        }

        res.status(200).json({
            message: "User profile fetched successfully!",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                managerId: user.managerId,
                isActive: user.isActive,
                lastLogin: user.lastLogin
            }
        })
    } catch (error) {
        return res.status(500).json({
            mesage: error.message || "Server error!"
        })
    }
}

export const adminTest = async (req, res, next) => {
    try {
        return res.status(200).json({
            message: "Admin test successfull!"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const getTeamUsers = async (req, res, next) => {
    try {

        const { id, role } = req.user;

        if (role === "admin") {
            const users = await User.find().select("-password")
            return res.json(users)
        }

        if (role === "sales_manager") {
            const users = await User.find({ $or: [{ _id: id }, { managerId: id }] }).select("-password")
            return res.json(users)
        }

        if (role === "sales_rep") {
            const users = await User.find({ _id: id }).select("-password");
            return res.json(users)
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const updteUser = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { firstName, lastName, email, role, managerId } = req.body;
        const { role: currentUserRole, id: currentUserId } = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }

        if (currentUserRole !== "admin") {
            if (currentUserId !== id) {
                return res.status(403).json({
                    message: "Access denied!"
                })
            }

            if (role) {
                return res.status(403).json({
                    message: "You cannot change role!"
                })
            }
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;

        if (currentUserRole === "admin") {
            user.role = role || user.role;
            user.managerId = managerId || user.managerId;
        }

        await user.save();

        res.status(200).json({
            message: "User update successfull!",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const deactivateUser = async (req, res, next) => {
    try {

        const { id } = req.params; //user to deactivate
        const { role: currentUserRole, id: currentUserId } = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }

        if (currentUserRole === "sales_rep") {
            return res.status(403).json({
                message: "Access denied!"
            })
        }

        if (currentUserRole === "sales_manager") {
            const teamUsers = await User.find({ managerId: currentUserId }).select("_id");

            const teamIds = teamUsers.map(u => u._id.toString());

            if (!teamIds.includes(id)) {
                return res.status(403).json({
                    message: "You can only deactivate your team members!"
                })
            }
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({
            message: "User deactivated successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const activateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role: currentUserRole, id: currentUserId } = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }

        if (currentUserRole === "sales_rep") {
            return res.status(403).json({
                message: "Access denied!"
            })
        }

        if (currentUserRole === "sales_manager") {
            const teamUsers = await User.find({ managerId: currentUserId }).select("_id");
            const teamIds = teamUsers.map(u => u._id.toString());
            if (!teamIds.includes(id)) {
                return res.status(403).json({
                    message: "You can only activate your team members!"
                })
            }
        }

        user.isActive = true;
        await user.save();

        res.status(200).json({
            message: "User activated successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const changePassword = async (req, res, next) => {
    try {

        const { oldPassword, newPassword } = req.body;
        const { id } = req.user;

        if (!oldPassword || !newPassword) {
            return res.status(403).json({
                message: "Both old and new passwords are required!"
            })
        }

        const user = await User.findById(id).select("+password");
        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(400).json({
                message: "Old password is incorrect!"
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long!"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password updated successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}

export const bulkReassignRecords = async (req, res, next) => {
    try {

        const { id } = req.params; //old user
        const { newOwnerId } = req.body;
        const { role, id: currentUserId } = req.user;

        if (!newOwnerId) {
            return res.status(403).json({
                message: "New owner ID is required!"
            })
        }

        const oldUser = await User.findById(id);
        const newUser = await User.findById(newOwnerId);

        if (!oldUser || !newUser) {
            return res.status(404).json({
                message: "User not found!"
            })
        }

        if (role === "sales_rep") {
            return res.status(403).json({
                message: "Access denied!"
            })
        }

        if (role === "sales_manager") {
            const teamUsers = await User.find({ $or: [{ _id: currentUserId }, { managerId: currentUserId }] }).select("_id")

            const teamIds = teamUsers.map(u => u._id.toString());

            if (!teamIds.includes(id) || !teamIds.includes(newOwnerId)) {
                return res.status(403).json({
                    message: "Both users must belong to your team!"
                })
            }
        }

        await Company.updateMany({ ownerId: id }, { ownerId: newOwnerId });
        await Contact.updateMany(
            { ownerId: id },
            { ownerId: newOwnerId }
        );
        await Deal.updateMany(
            { ownerId: id },
            { ownerId: newOwnerId }
        );

        return res.status(200).json({
            message: "All records reassigned successfully!"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error!"
        })
    }
}
export const logoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });
    return res.status(200).json({ message: "Logged out successfully!" });
}
