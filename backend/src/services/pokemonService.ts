import axios from "axios";
import { eq } from "drizzle-orm";
import {
  pokemon,
  pokemonTypes,
  pokemonStats,
  pokemonAbilities,
  pokemonMoves,
  pokemonForms,
  pokemonPastTypes,
  pokemonPastAbilities,
  type Pokemon,
  type PokemonStat,
  type PokemonType,
} from "../db/schema/index.js";

export let db: any;

export const setPokemonServiceDb = (database: any) => {
  db = database;
};

export const initializePokemonData = async () => {
  try {
    // Check if pokemon table has any data
    const existingPokemon = await db.select().from(pokemon).limit(1);

    if (existingPokemon.length > 0) {
      return;
    }

    // Fetch Pokemon list from PokeAPI
    const pokemonListResponse = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=1025"
    );
    const pokemonList = pokemonListResponse.data.results;

    const batchSize = 50;
    let processed = 0;

    for (let i = 0; i < pokemonList.length; i += batchSize) {
      const batch = pokemonList.slice(i, i + batchSize);

      const pokemonPromises = batch.map(async (pokemonRef: any) => {
        try {
          const response = await axios.get(pokemonRef.url);
          return response.data;
        } catch (error) {
          return null;
        }
      });

      const pokemonDetails = await Promise.all(pokemonPromises);

      for (const pokemonData of pokemonDetails) {
        if (!pokemonData) continue;

        try {
          const insertedPokemon = await db
            .insert(pokemon)
            .values({
              pokeApiId: pokemonData.id,
              name: pokemonData.name,
              baseExperience: pokemonData.base_experience,
              height: pokemonData.height,
              weight: pokemonData.weight,
              order: pokemonData.order,
              isDefault: pokemonData.is_default,
              spriteDefault: pokemonData.sprites?.front_default,
              spriteShiny: pokemonData.sprites?.front_shiny,
              spriteOfficialArtwork:
                pokemonData.sprites?.other?.["official-artwork"]?.front_default,
              spriteOfficialArtworkShiny:
                pokemonData.sprites?.other?.["official-artwork"]?.front_shiny,
              spriteHome: pokemonData.sprites?.other?.home?.front_default,
              spriteHomeShiny: pokemonData.sprites?.other?.home?.front_shiny,
              speciesName: pokemonData.species?.name,
              speciesUrl: pokemonData.species?.url,
              criesLatest: pokemonData.cries?.latest,
              criesLegacy: pokemonData.cries?.legacy,
              allSprites: pokemonData.sprites,
              gameIndices: pokemonData.game_indices,
              heldItems: pokemonData.held_items,
              locationAreaEncounters: pokemonData.location_area_encounters,
            })
            .returning();

          const pokemonId = insertedPokemon[0].id;

          if (pokemonData.types) {
            const typePromises = pokemonData.types.map((type: any) =>
              db.insert(pokemonTypes).values({
                pokemonId,
                slot: type.slot,
                typeName: type.type.name,
                typeUrl: type.type.url,
              })
            );
            await Promise.all(typePromises);
          }

          if (pokemonData.stats) {
            const statPromises = pokemonData.stats.map((stat: any) =>
              db.insert(pokemonStats).values({
                pokemonId,
                statName: stat.stat.name,
                baseStat: stat.base_stat,
                effort: stat.effort,
                statUrl: stat.stat.url,
              })
            );
            await Promise.all(statPromises);
          }

          if (pokemonData.abilities) {
            const abilityPromises = pokemonData.abilities.map((ability: any) =>
              db.insert(pokemonAbilities).values({
                pokemonId,
                abilityName: ability.ability.name,
                abilityUrl: ability.ability.url,
                isHidden: ability.is_hidden,
                slot: ability.slot,
              })
            );
            await Promise.all(abilityPromises);
          }

          if (pokemonData.moves && pokemonData.moves.length > 0) {
            const movePromises = pokemonData.moves
              .slice(0, 20)
              .map((move: any) =>
                db.insert(pokemonMoves).values({
                  pokemonId,
                  moveName: move.move.name,
                  moveUrl: move.move.url,
                  versionGroupDetails: move.version_group_details,
                })
              );
            await Promise.all(movePromises);
          }

          if (pokemonData.forms) {
            const formPromises = pokemonData.forms.map((form: any) =>
              db.insert(pokemonForms).values({
                pokemonId,
                formName: form.name,
                formUrl: form.url,
              })
            );
            await Promise.all(formPromises);
          }

          if (pokemonData.past_types) {
            const pastTypePromises = pokemonData.past_types.map(
              (pastType: any) =>
                db.insert(pokemonPastTypes).values({
                  pokemonId,
                  generationName: pastType.generation.name,
                  generationUrl: pastType.generation.url,
                  types: pastType.types,
                })
            );
            await Promise.all(pastTypePromises);
          }

          if (pokemonData.past_abilities) {
            const pastAbilityPromises = pokemonData.past_abilities.map(
              (pastAbility: any) =>
                db.insert(pokemonPastAbilities).values({
                  pokemonId,
                  generationName: pastAbility.generation.name,
                  generationUrl: pastAbility.generation.url,
                  abilities: pastAbility.abilities,
                })
            );
            await Promise.all(pastAbilityPromises);
          }

          processed++;
        } catch (dbError) {}
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {}
};

export const getPokemonList = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;

  const pokemonList = await db
    .select({
      id: pokemon.id,
      pokeApiId: pokemon.pokeApiId,
      name: pokemon.name,
      spriteDefault: pokemon.spriteDefault,
      spriteShiny: pokemon.spriteShiny,
      spriteOfficialArtwork: pokemon.spriteOfficialArtwork,
      baseExperience: pokemon.baseExperience,
      height: pokemon.height,
      weight: pokemon.weight,
    })
    .from(pokemon)
    .limit(limit)
    .offset(offset);

  const pokemonWithStats = await Promise.all(
    pokemonList.map(async (poke: any) => {
      const stats = await db
        .select()
        .from(pokemonStats)
        .where(eq(pokemonStats.pokemonId, poke.id));

      const types = await db
        .select()
        .from(pokemonTypes)
        .where(eq(pokemonTypes.pokemonId, poke.id));

      return {
        ...poke,
        stats,
        types,
      };
    })
  );

  const totalPokemon = await db.select().from(pokemon);

  return {
    pokemon: pokemonWithStats,
    pagination: {
      page,
      limit,
      total: totalPokemon.length,
      totalPages: Math.ceil(totalPokemon.length / limit),
    },
  };
};

export const getPokemonById = async (pokeApiId: number) => {
  const pokemonData = await db
    .select()
    .from(pokemon)
    .where(eq(pokemon.pokeApiId, pokeApiId))
    .limit(1);

  if (!pokemonData.length) {
    return null;
  }

  const types = await db
    .select()
    .from(pokemonTypes)
    .where(eq(pokemonTypes.pokemonId, pokemonData[0].id));

  const stats = await db
    .select()
    .from(pokemonStats)
    .where(eq(pokemonStats.pokemonId, pokemonData[0].id));

  const abilities = await db
    .select()
    .from(pokemonAbilities)
    .where(eq(pokemonAbilities.pokemonId, pokemonData[0].id));

  return {
    pokemon: pokemonData[0],
    types,
    stats,
    abilities,
  };
};
