import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import "dotenv/config"
import { connectdb } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"
import companyRoutes from "./routes/companyRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import dealRoutes from "./routes/dealRoutes.js"

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    // allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(cookieParser())

app.use("/api/auth", userRoutes)
app.use("/api/companies", companyRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/api/deals", dealRoutes)

connectdb()

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})