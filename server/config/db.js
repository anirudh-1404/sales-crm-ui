import mongoose from "mongoose"
import "dotenv/config"

export const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to database")
    } catch (err) {
        console.log("error connecting to database", err.message)
        process.exit(1)
    }
}