import jwt from 'jsonwebtoken'

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        
        if (!atoken) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized - No token provided" 
            });
        }
        
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
        
        // Check multiple conditions for security
        if (decoded.email !== process.env.ADMIN_EMAIL || 
            decoded.role !== 'admin' ||
            decoded.adminId !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized - Invalid admin credentials" 
            });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Authentication failed" 
        });
    }
}


export default authAdmin
