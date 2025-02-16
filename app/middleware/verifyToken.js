import jwt from "jsonwebtoken";



export const verifyToken = (req, res, next) => {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(403).json({
            message: "A token is required for authentication"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie("access_token");
        return res.status(401).json({
            message: "Invalid token",
            error: err
        });
    }
}