import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { eq, and, gte } from "drizzle-orm";
import { users, magicLinks } from "./db/schema/index.js";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: any;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Database setup
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

// Email configuration
const createEmailTransporter = () => {
  if (!process.env.EMAIL_HOST) {
    console.warn(
      "⚠️ EMAIL_HOST not configured. Emails will be logged to console."
    );
    return null;
  }

  const config: any = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  };

  if (process.env.EMAIL_USER || process.env.EMAIL_PASS) {
    config.auth = {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    };
  }

  return nodemailer.createTransport(config);
};

const emailTransporter = createEmailTransporter();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Auth middleware
const authenticateToken = async (
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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
    };
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = user[0];
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Magic link sign-in request
app.post("/api/auth/signin", async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store magic link in database
    await db.insert(magicLinks).values({
      email,
      token,
      expiresAt,
    });

    // Create magic link URL
    const magicLinkUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@pokedeck.com",
      to: email,
      subject: "🎮 Your PokéDeck Magic Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">⚡ Sign in to PokéDeck</h2>
          <p>Click the button below to sign in to your PokéDeck account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background: linear-gradient(to right, #FBBF24, #F59E0B); 
                      color: black; 
                      padding: 12px 24px; 
                      border-radius: 8px; 
                      text-decoration: none; 
                      font-weight: bold;
                      display: inline-block;">
              🎮 Sign In to PokéDeck
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            PokéDeck - Build Your Ultimate Pokémon Collection
          </p>
        </div>
      `,
    };

    if (emailTransporter) {
      try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Magic link email sent to ${email}`);

        res.json({
          message: "Magic link sent! Check your email.",
        });
      } catch (emailError) {
        res.json({
          message:
            "Magic link generated (email service unavailable). Check server logs.",

          ...(process.env.NODE_ENV === "development" && {
            magicLink: magicLinkUrl,
          }),
        });
      }
    } else {
      console.log(`🔗 Magic Link for ${email}: ${magicLinkUrl}`);
      console.log("📧 Email (simulated):", mailOptions.subject);

      res.json({
        message: "Magic link generated! Check server logs for the link.",
        ...(process.env.NODE_ENV === "development" && {
          magicLink: magicLinkUrl,
        }),
      });
    }
  } catch (error) {
    console.error("Magic link error:", error);
    res.status(500).json({ error: "Failed to send magic link" });
  }
});

// Verify magic link
app.get("/api/auth/verify", async (req: any, res: any) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const magicLink = await db
      .select()
      .from(magicLinks)
      .where(
        and(
          eq(magicLinks.token, token as string),
          eq(magicLinks.used, false),
          gte(magicLinks.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!magicLink.length) {
      return res.status(400).json({ error: "Invalid or expired magic link" });
    }

    const link = magicLink[0];

    await db
      .update(magicLinks)
      .set({ used: true })
      .where(eq(magicLinks.id, link.id));

    // Find or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, link.email))
      .limit(1);

    if (!user.length) {
      const newUser = await db
        .insert(users)
        .values({
          email: link.email,
          name: link.email.split("@")[0],
          lastLoginAt: new Date(),
        })
        .returning();
      user = newUser;
    } else {
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user[0].id));
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user[0].id, email: user[0].email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set secure cookie
    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Successfully signed in!",
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to verify magic link" });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req: any, res) => {
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

// Protected routes example
app.get("/api/pokemon", authenticateToken, async (req: any, res) => {
  try {
    res.json({
      message: `Hello ${req.user.name}! Here's your Pokemon data.`,
      user: req.user,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📧 Email mode: ${
      process.env.NODE_ENV === "development" ? "Console logging" : "SMTP"
    }`
  );
});
