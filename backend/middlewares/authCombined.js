import jwt from 'jsonwebtoken';
const authCombined = async (req, res, next) => {
    try {
        const { token, dtoken } = req.headers;
        if (!token && !dtoken) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: No token provided"
            });
        }
        let decoded;

        if (token) {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.id };
        } 
        else if (dtoken) {
            decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
            req.doctor = { id: decoded.id };
        }
        next();

    } catch (error) {
        console.log("Combined Auth Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Authentication failed: Invalid or expired token."
        });
    }
};

export default authCombined;
