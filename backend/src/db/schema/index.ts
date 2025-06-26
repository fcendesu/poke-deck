import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const magicLinks = pgTable("magic_links", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pokemon = pgTable("pokemon", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pokedexNumber: integer("pokedex_number").notNull(),
  type1: varchar("type1", { length: 50 }).notNull(),
  type2: varchar("type2", { length: 50 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deck = pgTable("deck", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deckPokemon = pgTable("deck_pokemon", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").references(() => deck.id),
  pokemonId: integer("pokemon_id").references(() => pokemon.id),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCardCollection = pgTable("user_card_collection", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pokemonId: integer("pokemon_id").references(() => pokemon.id),
  quantity: integer("quantity").default(1),
  lastDrawnAt: timestamp("last_drawn_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyDraws = pgTable("daily_draws", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  drawDate: timestamp("draw_date").defaultNow(),
  cardsDrawn: integer("cards_drawn").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MagicLink = typeof magicLinks.$inferSelect;
export type NewMagicLink = typeof magicLinks.$inferInsert;
export type Pokemon = typeof pokemon.$inferSelect;
export type NewPokemon = typeof pokemon.$inferInsert;
export type Deck = typeof deck.$inferSelect;
export type NewDeck = typeof deck.$inferInsert;
export type DeckPokemon = typeof deckPokemon.$inferSelect;
export type NewDeckPokemon = typeof deckPokemon.$inferInsert;
