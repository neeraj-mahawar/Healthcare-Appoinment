// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Invalid token format" });

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded JWT:", decoded);

    if (!decoded?.id)
      return res.status(401).json({ message: "Invalid token payload" });

    req.userId = decoded.id;
    req.role = decoded.role || "doctor"; // fallback
    next();
  } catch (err) {
    console.error("❌ JWT auth error:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
