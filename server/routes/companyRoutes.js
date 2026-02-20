import express from "express"
import { protect } from "../middlewares/authMiddleware.js";
import { changeOwnership, createCompany, deleteCompany, getCompanies, updateCompany } from "../controllers/companyController.js";

const router = express.Router();

router.post("/create", protect, createCompany)
router.get("/", protect, getCompanies)
router.put("/:id", protect, updateCompany)
router.delete("/:id", protect, deleteCompany);
router.patch("/:id/change-owner", protect, changeOwnership);

export default router;