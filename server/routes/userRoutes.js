import express from "express"
import { adminTest, activateUser, adminResetPassword, bulkReassignRecords, changePassword, deactivateUser, forgotPassword, getProfile, getTeamUsers, loginUser, logoutUser, registerUser, resetPassword, updateUser, softDeleteUser, getDeletedUsers, restoreUser } from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { requireRole } from "../middlewares/roleMiddleware.js"
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", protect, logoutUser)
router.get("/profile", protect, getProfile)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/setup-password", setupPassword)
router.post("/:id/resend-invitation", protect, resendInvitation)
router.get("/admin-test", protect, requireRole("admin"), adminTest)
router.get("/team", protect, getTeamUsers)
router.put("/:id", protect, updateUser)
router.patch("/:id/deactivate", protect, deactivateUser)
router.patch("/:id/activate", protect, activateUser)
router.patch("/:id/change-password", protect, changePassword)
router.patch("/:id/admin-reset-password", protect, requireRole("admin"), adminResetPassword)
router.patch("/:id/reassign", protect, bulkReassignRecords)
router.patch("/:id/soft-delete", protect, requireRole("admin"), softDeleteUser)
router.get("/trash", protect, requireRole("admin"), getDeletedUsers)
router.patch("/:id/restore", protect, requireRole("admin"), restoreUser)


export default router;