import axios from "axios";
import { eq, and, sql } from "drizzle-orm";
import {
  pokemon,
  pokemonTypes,
  pokemonStats,
  pokemonAbilities,
  pokemonMoves,
  pokemonForms,
  pokemonPastTypes,
  pokemonPastAbilities,
  userCardCollection,
  dailyDraws,
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

export const getPokemonList = async (
  page: number = 1,
  limit: number = 20,
  userId?: number
) => {
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

      // Check if user owns this card
      let isOwned = false;
      if (userId) {
        const collection = await db
          .select()
          .from(userCardCollection)
          .where(
            and(
              eq(userCardCollection.userId, userId),
              eq(userCardCollection.pokemonId, poke.id)
            )
          )
          .limit(1);
        isOwned = collection.length > 0;
      }

      return {
        ...poke,
        stats,
        types,
        isOwned,
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

export const getPokemonById = async (pokeApiId: number, userId?: number) => {
  const pokemonData = await db
    .select()
    .from(pokemon)
    .where(eq(pokemon.pokeApiId, pokeApiId))
    .limit(1);

  if (!pokemonData.length) {
    return null;
  }

  // Check if user owns this card
  let isOwned = false;
  if (userId) {
    const collection = await db
      .select()
      .from(userCardCollection)
      .where(
        and(
          eq(userCardCollection.userId, userId),
          eq(userCardCollection.pokemonId, pokemonData[0].id)
        )
      )
      .limit(1);
    isOwned = collection.length > 0;
  }

  if (!isOwned && userId) {
    return {
      pokemon: pokemonData[0],
      types: [],
      stats: [],
      abilities: [],
      isOwned: false,
      message: "You need to unlock this card first by drawing cards!",
    };
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
    isOwned: true,
  };
};

export const performDailyDraw = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if user has already drawn today
  const existingDraw = await db
    .select()
    .from(dailyDraws)
    .where(
      and(
        eq(dailyDraws.userId, userId),
        sql`${dailyDraws.drawDate} >= ${today}`,
        sql`${dailyDraws.drawDate} < ${tomorrow}`
      )
    )
    .limit(1);

  if (existingDraw.length > 0 && existingDraw[0].cardsDrawn >= 20) {
    return {
      success: false,
      message: "Daily draw limit reached. Come back tomorrow!",
      cardsDrawn: [],
      remainingDraws: 0,
    };
  }

  const currentDrawCount =
    existingDraw.length > 0 ? existingDraw[0].cardsDrawn : 0;
  const remainingDraws = Math.max(0, 20 - currentDrawCount);

  if (remainingDraws === 0) {
    return {
      success: false,
      message: "Daily draw limit reached. Come back tomorrow!",
      cardsDrawn: [],
      remainingDraws: 0,
    };
  }

  // Draw random Pokemon
  const drawCount = Math.min(5, remainingDraws); // Draw 5 cards at a time
  const totalPokemon = await db.select({ count: sql`count(*)` }).from(pokemon);
  const total = Number(totalPokemon[0].count);

  const drawnCards = [];
  const newCards = [];

  for (let i = 0; i < drawCount; i++) {
    const randomOffset = Math.floor(Math.random() * total);
    const randomPokemon = await db
      .select()
      .from(pokemon)
      .limit(1)
      .offset(randomOffset);

    if (randomPokemon.length > 0) {
      const pokemonData = randomPokemon[0];

      const existingCard = await db
        .select()
        .from(userCardCollection)
        .where(
          and(
            eq(userCardCollection.userId, userId),
            eq(userCardCollection.pokemonId, pokemonData.id)
          )
        )
        .limit(1);

      const isNewCard = existingCard.length === 0;

      if (isNewCard) {
        await db.insert(userCardCollection).values({
          userId,
          pokemonId: pokemonData.id,
          quantity: 1,
        });
        newCards.push(pokemonData);
      } else {
        await db
          .update(userCardCollection)
          .set({
            quantity: sql`${userCardCollection.quantity} + 1`,
            lastDrawnAt: new Date(),
          })
          .where(
            and(
              eq(userCardCollection.userId, userId),
              eq(userCardCollection.pokemonId, pokemonData.id)
            )
          );
      }

      drawnCards.push({
        ...pokemonData,
        isNewCard,
        quantity: isNewCard ? 1 : existingCard[0].quantity + 1,
      });
    }
  }

  if (existingDraw.length > 0) {
    await db
      .update(dailyDraws)
      .set({ cardsDrawn: currentDrawCount + drawCount })
      .where(eq(dailyDraws.id, existingDraw[0].id));
  } else {
    await db.insert(dailyDraws).values({
      userId,
      drawDate: new Date(),
      cardsDrawn: drawCount,
    });
  }

  return {
    success: true,
    message: `Drew ${drawCount} cards! ${newCards.length} new cards unlocked!`,
    cardsDrawn: drawnCards,
    newCards: newCards,
    remainingDraws: remainingDraws - drawCount,
  };
};

export const getUserDrawStatus = async (userId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingDraw = await db
    .select()
    .from(dailyDraws)
    .where(
      and(
        eq(dailyDraws.userId, userId),
        sql`${dailyDraws.drawDate} >= ${today}`,
        sql`${dailyDraws.drawDate} < ${tomorrow}`
      )
    )
    .limit(1);

  const cardsDrawn = existingDraw.length > 0 ? existingDraw[0].cardsDrawn : 0;
  const remainingDraws = Math.max(0, 20 - cardsDrawn);

  return {
    cardsDrawn,
    remainingDraws,
    canDraw: remainingDraws > 0,
  };
};
