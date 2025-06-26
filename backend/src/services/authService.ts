import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { eq, and, gte } from "drizzle-orm";
import { users, magicLinks } from "../db/schema/index.js";

export let db: any;

export const setAuthServiceDb = (database: any) => {
  db = database;
};

//
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Email configuration
const createEmailTransporter = () => {
  if (!process.env.EMAIL_HOST) {
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

export const sendMagicLink = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  // Generate magic link token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store magic link
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
      return {
        success: true,
        message: "Magic link sent! Check your email.",
      };
    } catch (emailError) {
      return {
        success: true,
        message:
          "Magic link generated (email service unavailable). Check server logs.",
        ...(process.env.NODE_ENV === "development" && {
          magicLink: magicLinkUrl,
        }),
      };
    }
  } else {
    return {
      success: true,
      message: "Magic link generated! Check server logs for the link.",
      ...(process.env.NODE_ENV === "development" && {
        magicLink: magicLinkUrl,
      }),
    };
  }
};

export const verifyMagicLink = async (token: string) => {
  if (!token) {
    throw new Error("Token is required");
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
    throw new Error("Invalid or expired magic link");
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

  return {
    token: jwtToken,
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
    },
  };
};

export const verifyJWTToken = async (token: string) => {
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
    throw new Error("Invalid token");
  }

  return user[0];
};
