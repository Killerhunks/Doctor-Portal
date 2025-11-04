import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized - No token provided" 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = { id: decoded.id };
        
        next();
    } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Authentication failed" 
        });
    }
}

export default authUser
