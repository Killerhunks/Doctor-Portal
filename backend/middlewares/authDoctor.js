import jwt from 'jsonwebtoken'

const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        
        if (!dtoken) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized - No token provided" 
            });
        }
        
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
        
        req.doctor = { id: decoded.id };
        
        next();
    } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Authentication failed" 
        });
    }
}

export default authDoctor
