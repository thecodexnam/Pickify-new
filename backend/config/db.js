import mongoose from "mongoose"


const connectDb=async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("db connected")
    } catch (error) {
        console.error("db error:", error?.message || error)
        if (error?.stack) {
            console.error(error.stack)
        }
    }
}

export default connectDb