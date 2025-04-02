import logger from "../utils/logger.js";

// verify if request.user is admin
export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        logger.info(`User ${req.user.id}(${req.user.email}) is performing admin action: ${
                JSON.stringify({
                    route: req.originalUrl,
                    method: req.method
                })
            }
        `);
        return next();
    }
    return res.status(403).json({ message: "Forbidden: Admin access required." });
};