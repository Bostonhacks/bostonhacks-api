
// verify if request.user is admin
export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        return next();
    }
    return res.status(403).json({ message: "Forbidden: Admin access required." });
};