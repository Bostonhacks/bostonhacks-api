import jwt from "jsonwebtoken";
// import prismaInstance from "../database/Prisma.js";
import logger from "../utils/logger.js";

// const prisma = prismaInstance;



export const verifyToken = async (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      message: "A token is required for authentication"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // const user = await prisma.user.findUnique({
    //     where: {
    //         id: decoded.id
    //     }
    // });

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      // isJudge: !!user.judge
    }


    // if user is admin, check if route is /admin route, if not return 403
    // actual auth check is in admin.js
    if (req.user.role !== "ADMIN" && req.originalUrl.startsWith("/admin")) {
      logger.warn(`User ${req.user.id}(${req.user.email}) tried to access admin route ${req.originalUrl}`);
      return res.status(403).json({
        message: "You do not have permission to access this route"
      });
    }
    if (req.user.role === "ADMIN" && !req.originalUrl.startsWith("/admin")) {
      return res.status(403).json({
        message: "Please use /admin routes for admin actions"
      });
    }

    next();
  } catch (err) {
    console.log(err);
    res.clearCookie("access_token", {
      httpOnly: true,
      domain: process.env.NODE_ENV === "production" ? process.env.ROOT_DOMAIN : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    return res.status(401).json({
      message: "Invalid token",
      error: err
    });
  }
}
