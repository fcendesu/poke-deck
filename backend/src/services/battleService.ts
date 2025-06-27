import { eq, and, sql } from "drizzle-orm";
import {
  battles,
  battleMoves,
  battleStats,
  pokemon,
  pokemonStats,
  pokemonTypes,
  userCardCollection,
  type Battle,
  type NewBattle,
} from "../db/schema/index.js";

export let db: any;

export const setBattleServiceDb = (database: any) => {
  db = database;
};

const BATTLE_MOVES = [
  {
    name: "Tackle",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    category: "physical",
  },
  {
    name: "Scratch",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    category: "physical",
  },
  {
    name: "Ember",
    type: "fire",
    power: 40,
    accuracy: 100,
    pp: 25,
    category: "special",
  },
  {
    name: "Water Gun",
    type: "water",
    power: 40,
    accuracy: 100,
    pp: 25,
    category: "special",
  },
  {
    name: "Thunder Shock",
    type: "electric",
    power: 40,
    accuracy: 100,
    pp: 30,
    category: "special",
  },
  {
    name: "Vine Whip",
    type: "grass",
    power: 45,
    accuracy: 100,
    pp: 25,
    category: "physical",
  },
  {
    name: "Ice Shard",
    type: "ice",
    power: 40,
    accuracy: 100,
    pp: 30,
    category: "physical",
  },
  {
    name: "Rock Throw",
    type: "rock",
    power: 50,
    accuracy: 90,
    pp: 15,
    category: "physical",
  },
  {
    name: "Gust",
    type: "flying",
    power: 40,
    accuracy: 100,
    pp: 35,
    category: "special",
  },
  {
    name: "Poison Sting",
    type: "poison",
    power: 15,
    accuracy: 100,
    pp: 35,
    category: "physical",
  },
  {
    name: "Confusion",
    type: "psychic",
    power: 50,
    accuracy: 100,
    pp: 25,
    category: "special",
  },
  {
    name: "Quick Attack",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 30,
    category: "physical",
  },
  {
    name: "Bite",
    type: "dark",
    power: 60,
    accuracy: 100,
    pp: 25,
    category: "physical",
  },
  {
    name: "Steel Wing",
    type: "steel",
    power: 70,
    accuracy: 90,
    pp: 25,
    category: "physical",
  },
  {
    name: "Fairy Wind",
    type: "fairy",
    power: 40,
    accuracy: 100,
    pp: 30,
    category: "special",
  },
];

const TYPE_EFFECTIVENESS: { [key: string]: { [key: string]: number } } = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    ice: 0.5,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
};

interface BattlePokemon {
  id: number;
  pokeApiId: number;
  name: string;
  spriteDefault: string;
  spriteOfficialArtwork: string;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  types: string[];
  moves: BattleMove[];
}

interface BattleMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  currentPp: number;
  category: string;
}

interface BattleState {
  playerTeam: BattlePokemon[];
  botTeam: BattlePokemon[];
  currentPlayerPokemon: number;
  currentBotPokemon: number;
  turn: "player" | "bot";
  battleLog: string[];
  isGameOver: boolean;
  winner?: "player" | "bot";
}

export const createBattle = async (userId: number, playerTeamIds: number[]) => {
  if (playerTeamIds.length !== 3) {
    throw new Error("Team must have exactly 3 Pokémon");
  }

  const playerTeam: BattlePokemon[] = [];
  for (const pokeApiId of playerTeamIds) {
    const pokemonData = await getPokemonBattleData(pokeApiId, userId);
    if (!pokemonData) {
      throw new Error(
        `You don't own Pokémon with ID ${pokeApiId} or it doesn't exist`
      );
    }
    playerTeam.push(pokemonData);
  }

  if (playerTeam.length !== 3) {
    throw new Error("Failed to create complete team");
  }

  const botTeam = await generateBotTeam();

  const battleState: BattleState = {
    playerTeam,
    botTeam,
    currentPlayerPokemon: 0,
    currentBotPokemon: 0,
    turn: playerTeam[0].speed >= botTeam[0].speed ? "player" : "bot",
    battleLog: [
      `Battle started!`,
      `${playerTeam[0].name} vs ${botTeam[0].name}!`,
      playerTeam[0].speed >= botTeam[0].speed
        ? `${playerTeam[0].name} is faster and goes first!`
        : `${botTeam[0].name} is faster and goes first!`,
    ],
    isGameOver: false,
  };

  const newBattle: NewBattle = {
    userId,
    opponentType: "bot",
    playerTeam: playerTeamIds,
    opponentTeam: botTeam.map((p) => p.pokeApiId),
    battleState: battleState as any,
    isCompleted: false,
  };

  const [battle] = await db.insert(battles).values(newBattle).returning();

  return { ...battleState, battleId: battle.id };
};

export const performMove = async (userId: number, moveIndex: number) => {
  const [battle] = await db
    .select()
    .from(battles)
    .where(and(eq(battles.userId, userId), eq(battles.isCompleted, false)))
    .orderBy(battles.createdAt)
    .limit(1);

  if (!battle) {
    throw new Error("No active battle found");
  }

  const battleState = battle.battleState as BattleState;

  if (battleState.isGameOver) {
    throw new Error("Battle is already over");
  }

  if (battleState.turn !== "player") {
    throw new Error("It's not your turn");
  }

  const playerPokemon =
    battleState.playerTeam[battleState.currentPlayerPokemon];
  const botPokemon = battleState.botTeam[battleState.currentBotPokemon];
  const selectedMove = playerPokemon.moves[moveIndex];

  if (!selectedMove || selectedMove.currentPp <= 0) {
    throw new Error("Invalid move or no PP remaining");
  }

  const playerDamage = calculateDamage(playerPokemon, botPokemon, selectedMove);
  botPokemon.currentHp = Math.max(0, botPokemon.currentHp - playerDamage);
  selectedMove.currentPp--;

  battleState.battleLog.push(
    `${playerPokemon.name} used ${selectedMove.name}!`
  );

  if (playerDamage > 0) {
    const effectiveness = getTypeEffectiveness(
      selectedMove.type,
      botPokemon.types
    );
    if (effectiveness > 1) {
      battleState.battleLog.push("It's super effective!");
    } else if (effectiveness < 1 && effectiveness > 0) {
      battleState.battleLog.push("It's not very effective...");
    } else if (effectiveness === 0) {
      battleState.battleLog.push("It had no effect!");
    }

    battleState.battleLog.push(
      `${botPokemon.name} took ${playerDamage} damage!`
    );
  }

  if (botPokemon.currentHp <= 0) {
    battleState.battleLog.push(`${botPokemon.name} fainted!`);

    const nextBotPokemon = battleState.botTeam.findIndex(
      (p, i) => i > battleState.currentBotPokemon && p.currentHp > 0
    );

    if (nextBotPokemon !== -1) {
      battleState.currentBotPokemon = nextBotPokemon;
      battleState.battleLog.push(
        `Bot sent out ${battleState.botTeam[nextBotPokemon].name}!`
      );
    } else {
      battleState.isGameOver = true;
      battleState.winner = "player";
      battleState.battleLog.push("You won the battle!");

      await updateBattleStats(userId, true);
      await db
        .update(battles)
        .set({
          battleState: battleState as any,
          winner: "player",
          isCompleted: true,
        })
        .where(eq(battles.id, battle.id));

      return battleState;
    }
  }

  if (!battleState.isGameOver) {
    battleState.turn = "bot";

    const botPokemonActive = battleState.botTeam[battleState.currentBotPokemon];
    const availableMoves = botPokemonActive.moves.filter(
      (m) => m.currentPp > 0
    );

    if (availableMoves.length > 0) {
      const botMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      const botDamage = calculateDamage(
        botPokemonActive,
        playerPokemon,
        botMove
      );

      playerPokemon.currentHp = Math.max(
        0,
        playerPokemon.currentHp - botDamage
      );
      botMove.currentPp--;

      battleState.battleLog.push(
        `${botPokemonActive.name} used ${botMove.name}!`
      );

      if (botDamage > 0) {
        const effectiveness = getTypeEffectiveness(
          botMove.type,
          playerPokemon.types
        );
        if (effectiveness > 1) {
          battleState.battleLog.push("It's super effective!");
        } else if (effectiveness < 1 && effectiveness > 0) {
          battleState.battleLog.push("It's not very effective...");
        } else if (effectiveness === 0) {
          battleState.battleLog.push("It had no effect!");
        }

        battleState.battleLog.push(
          `${playerPokemon.name} took ${botDamage} damage!`
        );
      }

      if (playerPokemon.currentHp <= 0) {
        battleState.battleLog.push(`${playerPokemon.name} fainted!`);

        const nextPlayerPokemon = battleState.playerTeam.findIndex(
          (p, i) => i > battleState.currentPlayerPokemon && p.currentHp > 0
        );

        if (nextPlayerPokemon !== -1) {
          battleState.currentPlayerPokemon = nextPlayerPokemon;
          battleState.battleLog.push(
            `You sent out ${battleState.playerTeam[nextPlayerPokemon].name}!`
          );
        } else {
          battleState.isGameOver = true;
          battleState.winner = "bot";
          battleState.battleLog.push("You lost the battle!");

          await updateBattleStats(userId, false);
          await db
            .update(battles)
            .set({
              battleState: battleState as any,
              winner: "bot",
              isCompleted: true,
            })
            .where(eq(battles.id, battle.id));

          return battleState;
        }
      }
    }

    battleState.turn = "player";
  }

  await db
    .update(battles)
    .set({ battleState: battleState as any })
    .where(eq(battles.id, battle.id));

  return battleState;
};

const getPokemonBattleData = async (
  pokeApiId: number,
  userId: number
): Promise<BattlePokemon | null> => {
  const pokemonData = await db
    .select()
    .from(pokemon)
    .leftJoin(pokemonStats, eq(pokemon.id, pokemonStats.pokemonId))
    .leftJoin(pokemonTypes, eq(pokemon.id, pokemonTypes.pokemonId))
    .leftJoin(
      userCardCollection,
      and(
        eq(pokemon.id, userCardCollection.pokemonId),
        eq(userCardCollection.userId, userId)
      )
    )
    .where(eq(pokemon.pokeApiId, pokeApiId));

  if (pokemonData.length === 0) return null;

  const hasOwnership = pokemonData.some(
    (row: any) => row.user_card_collection !== null
  );
  if (!hasOwnership) return null;

  const poke = pokemonData[0].pokemon;
  const stats = pokemonData
    .filter((row: any) => row.pokemon_stats)
    .map((row: any) => row.pokemon_stats);
  const types = pokemonData
    .filter((row: any) => row.pokemon_types)
    .map((row: any) => row.pokemon_types!.typeName);

  const hpStat = stats.find((s: any) => s!.statName === "hp")?.baseStat || 50;
  const attackStat =
    stats.find((s: any) => s!.statName === "attack")?.baseStat || 50;
  const defenseStat =
    stats.find((s: any) => s!.statName === "defense")?.baseStat || 50;
  const speedStat =
    stats.find((s: any) => s!.statName === "speed")?.baseStat || 50;

  const maxHp = Math.floor(((hpStat * 2 + 100) * 50) / 100) + 10;

  const moves = assignMovesToPokemon(types);

  return {
    id: poke.id,
    pokeApiId: poke.pokeApiId,
    name: poke.name,
    spriteDefault: poke.spriteDefault || "",
    spriteOfficialArtwork: poke.spriteOfficialArtwork || "",
    currentHp: maxHp,
    maxHp,
    attack: attackStat,
    defense: defenseStat,
    speed: speedStat,
    types,
    moves,
  };
};

const generateBotTeam = async (): Promise<BattlePokemon[]> => {
  const randomPokemon = await db
    .select()
    .from(pokemon)
    .leftJoin(pokemonStats, eq(pokemon.id, pokemonStats.pokemonId))
    .leftJoin(pokemonTypes, eq(pokemon.id, pokemonTypes.pokemonId))
    .orderBy(sql`RANDOM()`)
    .limit(100); // Get more to ensure we have enough data

  const botTeam: BattlePokemon[] = [];
  const usedPokemon = new Set();

  for (let i = 0; i < 3 && botTeam.length < 3; i++) {
    for (const row of randomPokemon) {
      if (botTeam.length >= 3) break;

      const poke = row.pokemon;
      if (usedPokemon.has(poke.pokeApiId)) continue;

      const pokemonRows = randomPokemon.filter(
        (r: any) => r.pokemon.id === poke.id
      );
      const stats = pokemonRows
        .filter((r: any) => r.pokemon_stats)
        .map((r: any) => r.pokemon_stats);
      const types = pokemonRows
        .filter((r: any) => r.pokemon_types)
        .map((r: any) => r.pokemon_types!.typeName);

      if (stats.length > 0) {
        const hpStat =
          stats.find((s: any) => s!.statName === "hp")?.baseStat || 50;
        const attackStat =
          stats.find((s: any) => s!.statName === "attack")?.baseStat || 50;
        const defenseStat =
          stats.find((s: any) => s!.statName === "defense")?.baseStat || 50;
        const speedStat =
          stats.find((s: any) => s!.statName === "speed")?.baseStat || 50;

        const maxHp = Math.floor(((hpStat * 2 + 100) * 50) / 100) + 10;
        const moves = assignMovesToPokemon(types);

        botTeam.push({
          id: poke.id,
          pokeApiId: poke.pokeApiId,
          name: poke.name,
          spriteDefault: poke.spriteDefault || "",
          spriteOfficialArtwork: poke.spriteOfficialArtwork || "",
          currentHp: maxHp,
          maxHp,
          attack: attackStat,
          defense: defenseStat,
          speed: speedStat,
          types,
          moves,
        });

        usedPokemon.add(poke.pokeApiId);
      }
    }
  }

  return botTeam;
};

const assignMovesToPokemon = (types: string[]): BattleMove[] => {
  const moves: BattleMove[] = [];

  moves.push({
    name: "Tackle",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    currentPp: 35,
    category: "physical",
  });

  for (const type of types) {
    const typeMove = BATTLE_MOVES.find((m) => m.type === type);
    if (typeMove && !moves.find((m) => m.name === typeMove.name)) {
      moves.push({
        ...typeMove,
        currentPp: typeMove.pp,
      });
    }
  }

  while (moves.length < 4) {
    const randomMove =
      BATTLE_MOVES[Math.floor(Math.random() * BATTLE_MOVES.length)];
    if (!moves.find((m) => m.name === randomMove.name)) {
      moves.push({
        ...randomMove,
        currentPp: randomMove.pp,
      });
    }
  }

  return moves.slice(0, 4);
};

const calculateDamage = (
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove
): number => {
  if (move.power === 0) return 0;

  const level = 50;
  const attack = attacker.attack;
  const defense = defender.defense;
  const power = move.power;

  let damage = Math.floor(
    (((2 * level) / 5 + 2) * attack * power) / defense / 50 + 2
  );

  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  damage = Math.floor(damage * effectiveness);

  const randomFactor = 0.85 + Math.random() * 0.15;
  damage = Math.floor(damage * randomFactor);

  if (damage < 1 && effectiveness > 0) damage = 1;

  return damage;
};

const getTypeEffectiveness = (
  attackType: string,
  defenderTypes: string[]
): number => {
  let effectiveness = 1;

  for (const defenderType of defenderTypes) {
    const typeChart = TYPE_EFFECTIVENESS[attackType];
    if (typeChart && typeChart[defenderType] !== undefined) {
      effectiveness *= typeChart[defenderType];
    }
  }

  return effectiveness;
};

const updateBattleStats = async (userId: number, won: boolean) => {
  let [userStats] = await db
    .select()
    .from(battleStats)
    .where(eq(battleStats.userId, userId))
    .limit(1);

  if (!userStats) {
    userStats = {
      id: 0,
      userId,
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      rating: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  userStats.totalBattles++;

  if (won) {
    userStats.wins++;
    userStats.winStreak++;
    userStats.bestWinStreak = Math.max(
      userStats.bestWinStreak,
      userStats.winStreak
    );
    userStats.rating += 25;
  } else {
    userStats.losses++;
    userStats.winStreak = 0;
    userStats.rating = Math.max(800, userStats.rating - 20);
  }

  userStats.updatedAt = new Date();

  if (userStats.id === 0) {
    await db.insert(battleStats).values(userStats);
  } else {
    await db
      .update(battleStats)
      .set(userStats)
      .where(eq(battleStats.id, userStats.id));
  }
};

export const getUserBattleStats = async (userId: number) => {
  const [stats] = await db
    .select()
    .from(battleStats)
    .where(eq(battleStats.userId, userId))
    .limit(1);

  return (
    stats || {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      rating: 1000,
    }
  );
};
