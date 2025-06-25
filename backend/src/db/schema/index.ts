import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

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

export type Pokemon = typeof pokemon.$inferSelect;
export type NewPokemon = typeof pokemon.$inferInsert;
export type Deck = typeof deck.$inferSelect;
export type NewDeck = typeof deck.$inferInsert;
export type DeckPokemon = typeof deckPokemon.$inferSelect;
export type NewDeckPokemon = typeof deckPokemon.$inferInsert;
