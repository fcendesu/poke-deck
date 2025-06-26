import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
  json,
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

// Enhanced Pokemon table with full PokeAPI data
export const pokemon = pgTable("pokemon", {
  id: serial("id").primaryKey(),
  pokeApiId: integer("poke_api_id").notNull().unique(), // The ID from PokeAPI
  name: varchar("name", { length: 255 }).notNull(),
  baseExperience: integer("base_experience"),
  height: integer("height"), // in decimeters
  weight: integer("weight"), // in hectograms
  order: integer("order"),
  isDefault: boolean("is_default").default(true),

  // Sprites - most commonly used ones
  spriteDefault: text("sprite_default"),
  spriteShiny: text("sprite_shiny"),
  spriteOfficialArtwork: text("sprite_official_artwork"),
  spriteOfficialArtworkShiny: text("sprite_official_artwork_shiny"),
  spriteHome: text("sprite_home"),
  spriteHomeShiny: text("sprite_home_shiny"),

  // Species and cries
  speciesName: varchar("species_name", { length: 255 }),
  speciesUrl: text("species_url"),
  criesLatest: text("cries_latest"),
  criesLegacy: text("cries_legacy"),

  // JSON fields for complex data
  allSprites: json("all_sprites"), // Complete sprites object
  gameIndices: json("game_indices"), // Array of game indices
  heldItems: json("held_items"), // Array of held items
  locationAreaEncounters: text("location_area_encounters"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pokemon Types (since a Pokemon can have 1-2 types)
export const pokemonTypes = pgTable("pokemon_types", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  slot: integer("slot").notNull(), // 1 or 2
  typeName: varchar("type_name", { length: 50 }).notNull(),
  typeUrl: text("type_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pokemon Stats (HP, Attack, Defense, etc.)
export const pokemonStats = pgTable("pokemon_stats", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  statName: varchar("stat_name", { length: 50 }).notNull(), // hp, attack, defense, special-attack, special-defense, speed
  baseStat: integer("base_stat").notNull(),
  effort: integer("effort").notNull(),
  statUrl: text("stat_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pokemon Abilities
export const pokemonAbilities = pgTable("pokemon_abilities", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  abilityName: varchar("ability_name", { length: 100 }).notNull(),
  abilityUrl: text("ability_url"),
  isHidden: boolean("is_hidden").default(false),
  slot: integer("slot").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pokemon Moves (this will be a large table)
export const pokemonMoves = pgTable("pokemon_moves", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  moveName: varchar("move_name", { length: 100 }).notNull(),
  moveUrl: text("move_url"),
  versionGroupDetails: json("version_group_details"), // Array of version group details
  createdAt: timestamp("created_at").defaultNow(),
});

// Pokemon Forms
export const pokemonForms = pgTable("pokemon_forms", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  formName: varchar("form_name", { length: 100 }).notNull(),
  formUrl: text("form_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pokemon Past Types (for Pokemon that had different types in previous generations)
export const pokemonPastTypes = pgTable("pokemon_past_types", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  generationName: varchar("generation_name", { length: 50 }).notNull(),
  generationUrl: text("generation_url"),
  types: json("types"), // Array of types for that generation
  createdAt: timestamp("created_at").defaultNow(),
});

// Pokemon Past Abilities
export const pokemonPastAbilities = pgTable("pokemon_past_abilities", {
  id: serial("id").primaryKey(),
  pokemonId: integer("pokemon_id")
    .references(() => pokemon.id)
    .notNull(),
  generationName: varchar("generation_name", { length: 50 }).notNull(),
  generationUrl: text("generation_url"),
  abilities: json("abilities"), // Array of abilities for that generation
  createdAt: timestamp("created_at").defaultNow(),
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

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MagicLink = typeof magicLinks.$inferSelect;
export type NewMagicLink = typeof magicLinks.$inferInsert;

export type Pokemon = typeof pokemon.$inferSelect;
export type NewPokemon = typeof pokemon.$inferInsert;
export type PokemonType = typeof pokemonTypes.$inferSelect;
export type NewPokemonType = typeof pokemonTypes.$inferInsert;
export type PokemonStat = typeof pokemonStats.$inferSelect;
export type NewPokemonStat = typeof pokemonStats.$inferInsert;
export type PokemonAbility = typeof pokemonAbilities.$inferSelect;
export type NewPokemonAbility = typeof pokemonAbilities.$inferInsert;
export type PokemonMove = typeof pokemonMoves.$inferSelect;
export type NewPokemonMove = typeof pokemonMoves.$inferInsert;
export type PokemonForm = typeof pokemonForms.$inferSelect;
export type NewPokemonForm = typeof pokemonForms.$inferInsert;
export type PokemonPastType = typeof pokemonPastTypes.$inferSelect;
export type NewPokemonPastType = typeof pokemonPastTypes.$inferInsert;
export type PokemonPastAbility = typeof pokemonPastAbilities.$inferSelect;
export type NewPokemonPastAbility = typeof pokemonPastAbilities.$inferInsert;

export type Deck = typeof deck.$inferSelect;
export type NewDeck = typeof deck.$inferInsert;
export type DeckPokemon = typeof deckPokemon.$inferSelect;
export type NewDeckPokemon = typeof deckPokemon.$inferInsert;
export type UserCardCollection = typeof userCardCollection.$inferSelect;
export type NewUserCardCollection = typeof userCardCollection.$inferInsert;
export type DailyDraw = typeof dailyDraws.$inferSelect;
export type NewDailyDraw = typeof dailyDraws.$inferInsert;
