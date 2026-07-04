import jwt from "jsonwebtoken"

const isAuth=async (req,res,next) => {
    try {
        const token=req.cookies?.token || req.headers?.authorization?.split(" ")[1]
        if(!token){
            return res.status(401).json({message:"token not found"})
        }
        if(!process.env.JWT_SECRET){
            return res.status(500).json({message:"JWT_SECRET is not configured"})
        }
        const decodeToken=jwt.verify(token,process.env.JWT_SECRET)
        if(!decodeToken){
 return res.status(401).json({message:"token not verify"})
        }
        req.userId=decodeToken.userId
        next()
    } catch (error) {
         return res.status(401).json({message:error.message || "invalid token"})
    }
}

export default isAuth
