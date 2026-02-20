import express from "express"
import { adminTest, activateUser, bulkReassignRecords, changePassword, deactivateUser, getProfile, getTeamUsers, loginUser, logoutUser, registerUser, updteUser } from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { requireRole } from "../middlewares/roleMiddleware.js"
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", protect, logoutUser)
router.get("/profile", protect, getProfile)
router.get("/admin-test", protect, requireRole("admin"), adminTest)
router.get("/team", protect, getTeamUsers)
router.put("/:id", protect, updteUser)
router.patch("/:id/deactivate", protect, deactivateUser)
router.patch("/:id/activate", protect, activateUser)
router.patch("/:id/change-password", protect, changePassword)
router.patch("/:id/reassign", protect, bulkReassignRecords)


export default router;