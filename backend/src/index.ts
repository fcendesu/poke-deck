import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  initializePokemonData,
  setPokemonServiceDb,
  getPokemonList,
  getPokemonById,
} from "./services/pokemonService.js";
import {
  sendMagicLink,
  verifyMagicLink,
  setAuthServiceDb,
} from "./services/authService.js";
import { authenticateToken, AuthenticatedRequest } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER || "postgres"}:${
      process.env.DB_PASSWORD || "postgres"
    }@${process.env.DB_HOST || "postgres"}:${process.env.DB_PORT || "5432"}/${
      process.env.DB_NAME || "pokedeck"
    }`,
});

export const db = drizzle(pool);

setPokemonServiceDb(db);
setAuthServiceDb(db);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Simple Pokemon count
app.get("/api/pokemon/count", async (req, res) => {
  try {
    const { pokemon } = await import("./db/schema/index.js");
    const count = await db.select().from(pokemon);
    res.json({
      count: count.length,
      expected: 1025,
      isComplete: count.length >= 1025,
      percentage: Math.round((count.length / 1025) * 100),
    });
  } catch (error) {
    res.json({ count: 0, expected: 1025, isComplete: false, percentage: 0 });
  }
});

// Magic link sign-in
app.post("/api/auth/signin", async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const result = await sendMagicLink(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to send magic link" });
  }
});

// Verify magic link
app.get("/api/auth/verify", async (req: any, res: any) => {
  try {
    const { token } = req.query;
    const result = await verifyMagicLink(token);

    // Set secure cookie
    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Successfully signed in!",
      user: result.user,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify magic link" });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

// Sign out
app.post("/api/auth/signout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Signed out successfully" });
});

// Get Pokemon list
app.get(
  "/api/pokemon",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await getPokemonList(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get specific Pokemon details
app.get(
  "/api/pokemon/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const pokemonId = parseInt(req.params.id);

      const result = await getPokemonById(pokemonId);

      if (!result) {
        res.status(404).json({ error: "Pokemon not found" });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.listen(PORT, () => {
  initializePokemonData();
});
