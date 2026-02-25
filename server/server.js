import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();
import { connectdb } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"
import companyRoutes from "./routes/companyRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import dealRoutes from "./routes/dealRoutes.js"
import auditLogRoutes from "./routes/auditLogRoutes.js"
// console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const allowedOrigins = [
    "http://localhost:5173",
    "https://sales-crm-ui-87gs.vercel.app"
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
// app.options("/(.*)", cors())
app.use(cookieParser())

// Health check and root route
app.get("/", (req, res) => res.status(200).send("Sales CRM API is running..."));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Catch-all route for debugging 404s
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        hint: "Make sure you are prefixing your requests with /api"
    });
});

connectdb()

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})