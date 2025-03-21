import jwt from "jsonwebtoken";
import prismaInstance from "../database/Prisma.js";

const prisma = prismaInstance;



export const verifyToken = async(req, res, next) => {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({
            message: "A token is required for authentication"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isJudge: !!user.judge
        }

        // if user is admin, check if route is /admin route, if not return 403
        if (req.user.role !== "ADMIN" && req.path.startsWith("/admin")) {
            return res.status(403).json({
                message: "You do not have permission to access this route"
            });
        }
        if (req.user.role === "ADMIN" && !req.path.startsWith("/admin")) {
            return res.status(403).json({
                message: "Please use /admin routes for admin actions"
            });
        }

        next();
    } catch (err) {
        res.clearCookie("access_token", {
            httpOnly: true,
            domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        return res.status(401).json({
            message: "Invalid token",
            error: err
        });
    }
}