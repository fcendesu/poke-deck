import { Request, Response, NextFunction } from "express";
import { verifyJWTToken } from "../services/authService.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Auth middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const user = await verifyJWTToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export type { AuthenticatedRequest };
