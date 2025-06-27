#!/usr/bin/env tsx

import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  initializePokemonData,
  setPokemonServiceDb,
} from "../services/pokemonService.js";

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER || "postgres"}:${
      process.env.DB_PASSWORD || "postgres"
    }@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${
      process.env.DB_NAME || "pokedeck"
    }`,
});

const db = drizzle(pool);

async function main() {
  try {
    console.log("🚀 Starting Pokémon data initialization...");

    // Set up the database for the Pokemon service
    setPokemonServiceDb(db);

    // Initialize Pokemon data
    await initializePokemonData();

    console.log("✅ Pokémon data initialization completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during Pokémon data initialization:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
