"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Pokemon {
  id: number;
  pokeApiId: number;
  name: string;
  spriteDefault: string;
  spriteOfficialArtwork: string;
  baseExperience?: number;
  height?: number;
  weight?: number;
  stats?: PokemonStat[];
  types?: PokemonType[];
  isOwned?: boolean;
}

interface PokemonStat {
  id: number;
  pokemonId: number;
  statName: string;
  baseStat: number;
  effort: number;
}

interface PokemonType {
  id: number;
  pokemonId: number;
  slot: number;
  typeName: string;
}

interface BattlePokemon extends Pokemon {
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: BattleMove[];
}

interface BattleMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  currentPp: number;
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

export default function BattleArenaPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState<"menu" | "team-select" | "battle">(
    "menu"
  );
  const [ownedPokemon, setOwnedPokemon] = useState<Pokemon[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Pokemon[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && gameMode === "team-select") {
      fetchOwnedPokemon();
    }
  }, [user, gameMode]);

  const checkAuth = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/auth/me`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/sign-in");
      }
    } catch (error) {
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnedPokemon = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/pokemon?owned=owned&limit=1000`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setOwnedPokemon(data.pokemon || []);
      }
    } catch (error) {
      console.error("Error fetching owned Pokemon:", error);
    }
  };

  const handleTeamSelection = (pokemon: Pokemon) => {
    if (selectedTeam.find((p) => p.id === pokemon.id)) {
      setSelectedTeam(selectedTeam.filter((p) => p.id !== pokemon.id));
    } else if (selectedTeam.length < 3) {
      setSelectedTeam([...selectedTeam, pokemon]);
    }
  };

  const startBattle = async () => {
    if (selectedTeam.length !== 3) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/battle/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            team: selectedTeam.map((p) => p.pokeApiId),
          }),
        }
      );

      if (response.ok) {
        const battle = await response.json();
        setBattleState(battle);
        setGameMode("battle");
      }
    } catch (error) {
      console.error("Error starting battle:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const performMove = async (moveIndex: number) => {
    if (!battleState || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/battle/move`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ moveIndex }),
        }
      );

      if (response.ok) {
        const updatedBattle = await response.json();
        setBattleState(updatedBattle);
      }
    } catch (error) {
      console.error("Error performing move:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-300",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    };
    return colors[type] || "bg-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            ⚔️ Battle Arena
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-white/80">Trainer: {user?.name}</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              ← Back to Collection
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {gameMode === "menu" && (
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">⚔️</h1>
            <h1 className="text-4xl font-bold text-white mb-8">Battle Arena</h1>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Enter the arena and test your Pokémon team against challenging AI
              opponents! Build your strategy, master type advantages, and become
              the ultimate trainer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🤖 VS AI Bot
                </h3>
                <p className="text-white/80 mb-6">
                  Battle against intelligent AI opponents with randomly
                  generated teams. Perfect for practicing your strategies!
                </p>
                <button
                  onClick={() => setGameMode("team-select")}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg"
                >
                  Choose Your Team
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 opacity-60">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🏆 Tournament
                </h3>
                <p className="text-white/80 mb-6">
                  Compete in ranked tournaments against multiple opponents.
                  Climb the leaderboards and earn exclusive rewards!
                </p>
                <button
                  disabled
                  className="w-full bg-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}

        {gameMode === "team-select" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose Your Team
              </h2>
              <p className="text-white/80 mb-6">
                Select 3 Pokémon from your collection to battle (
                {selectedTeam.length}/3 selected)
              </p>

              {selectedTeam.length === 3 && (
                <button
                  onClick={startBattle}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg mb-6"
                >
                  {isProcessing ? "Starting Battle..." : "🚀 Start Battle!"}
                </button>
              )}
            </div>

            {selectedTeam.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  Selected Team:
                </h3>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {selectedTeam.map((pokemon, index) => (
                    <div
                      key={pokemon.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20"
                    >
                      <img
                        src={
                          pokemon.spriteOfficialArtwork || pokemon.spriteDefault
                        }
                        alt={pokemon.name}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <p className="text-white font-semibold capitalize text-sm">
                        {pokemon.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ownedPokemon.map((pokemon) => (
                <div
                  key={pokemon.id}
                  onClick={() => handleTeamSelection(pokemon)}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer transition-all duration-300 border-2 ${
                    selectedTeam.find((p) => p.id === pokemon.id)
                      ? "border-yellow-400 ring-2 ring-yellow-400/50 transform scale-105"
                      : "border-white/20 hover:border-white/40 hover:transform hover:scale-105"
                  }`}
                >
                  <img
                    src={pokemon.spriteOfficialArtwork || pokemon.spriteDefault}
                    alt={pokemon.name}
                    className="w-20 h-20 mx-auto mb-2"
                  />
                  <p className="text-white font-semibold capitalize text-sm">
                    {pokemon.name}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {pokemon.types?.map((type) => (
                      <span
                        key={type.id}
                        className={`${getTypeColor(
                          type.typeName
                        )} text-white text-xs px-2 py-1 rounded-full`}
                      >
                        {type.typeName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {ownedPokemon.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/80 text-lg">
                  You need to own some Pokémon to battle!
                  <Link
                    href="/dashboard"
                    className="text-yellow-400 hover:text-yellow-300 ml-2"
                  >
                    Go collect some cards first →
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}

        {gameMode === "battle" && battleState && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Battle Field */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6 text-center">
                    Battle Field
                  </h3>

                  {/* Bot Pokemon */}
                  <div className="text-center mb-8">
                    <h4 className="text-white/80 mb-2">Opponent</h4>
                    <div className="bg-red-500/20 rounded-xl p-4 inline-block">
                      <img
                        src={
                          battleState.botTeam[battleState.currentBotPokemon]
                            ?.spriteOfficialArtwork ||
                          battleState.botTeam[battleState.currentBotPokemon]
                            ?.spriteDefault
                        }
                        alt={
                          battleState.botTeam[battleState.currentBotPokemon]
                            ?.name
                        }
                        className="w-32 h-32 mx-auto mb-2"
                      />
                      <p className="text-white font-bold capitalize">
                        {
                          battleState.botTeam[battleState.currentBotPokemon]
                            ?.name
                        }
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (battleState.botTeam[
                                battleState.currentBotPokemon
                              ]?.currentHp /
                                battleState.botTeam[
                                  battleState.currentBotPokemon
                                ]?.maxHp) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-white/80 text-sm mt-1">
                        {
                          battleState.botTeam[battleState.currentBotPokemon]
                            ?.currentHp
                        }{" "}
                        /{" "}
                        {
                          battleState.botTeam[battleState.currentBotPokemon]
                            ?.maxHp
                        }{" "}
                        HP
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-4xl">⚔️</span>
                  </div>

                  <div className="text-center">
                    <h4 className="text-white/80 mb-2">Your Pokémon</h4>
                    <div className="bg-blue-500/20 rounded-xl p-4 inline-block">
                      <img
                        src={
                          battleState.playerTeam[
                            battleState.currentPlayerPokemon
                          ]?.spriteOfficialArtwork ||
                          battleState.playerTeam[
                            battleState.currentPlayerPokemon
                          ]?.spriteDefault
                        }
                        alt={
                          battleState.playerTeam[
                            battleState.currentPlayerPokemon
                          ]?.name
                        }
                        className="w-32 h-32 mx-auto mb-2"
                      />
                      <p className="text-white font-bold capitalize">
                        {
                          battleState.playerTeam[
                            battleState.currentPlayerPokemon
                          ]?.name
                        }
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (battleState.playerTeam[
                                battleState.currentPlayerPokemon
                              ]?.currentHp /
                                battleState.playerTeam[
                                  battleState.currentPlayerPokemon
                                ]?.maxHp) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-white/80 text-sm mt-1">
                        {
                          battleState.playerTeam[
                            battleState.currentPlayerPokemon
                          ]?.currentHp
                        }{" "}
                        /{" "}
                        {
                          battleState.playerTeam[
                            battleState.currentPlayerPokemon
                          ]?.maxHp
                        }{" "}
                        HP
                      </p>
                    </div>
                  </div>
                </div>

                {battleState.turn === "player" && !battleState.isGameOver && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6">
                    <h4 className="text-lg font-bold text-white mb-4">
                      Choose Your Move
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {battleState.playerTeam[
                        battleState.currentPlayerPokemon
                      ]?.moves.map((move, index) => (
                        <button
                          key={index}
                          onClick={() => performMove(index)}
                          disabled={isProcessing || move.currentPp === 0}
                          className={`p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                            move.currentPp === 0
                              ? "bg-gray-600 cursor-not-allowed opacity-50"
                              : `${getTypeColor(move.type)} hover:shadow-lg`
                          }`}
                        >
                          <p className="text-white font-bold">{move.name}</p>
                          <p className="text-white/80 text-sm">
                            Power: {move.power}
                          </p>
                          <p className="text-white/80 text-sm">
                            PP: {move.currentPp}/{move.pp}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {battleState.isGameOver && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {battleState.winner === "player"
                        ? "🎉 Victory!"
                        : "💀 Defeat!"}
                    </h3>
                    <p className="text-white/80 mb-6">
                      {battleState.winner === "player"
                        ? "Congratulations! You defeated the AI trainer!"
                        : "Better luck next time! Train your Pokémon and try again."}
                    </p>
                    <div className="space-x-4">
                      <button
                        onClick={() => {
                          setGameMode("team-select");
                          setBattleState(null);
                          setSelectedTeam([]);
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                      >
                        ⚔️ Battle Again
                      </button>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                      >
                        🏠 Back to Collection
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    Team Status
                  </h4>

                  <div className="mb-4">
                    <h5 className="text-white/80 mb-2">Your Team</h5>
                    <div className="space-y-2">
                      {battleState.playerTeam.map((pokemon, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-2 rounded-lg ${
                            index === battleState.currentPlayerPokemon
                              ? "bg-blue-500/20"
                              : "bg-white/5"
                          }`}
                        >
                          <img
                            src={pokemon.spriteDefault}
                            alt={pokemon.name}
                            className="w-8 h-8 mr-2"
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm capitalize">
                              {pokemon.name}
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  pokemon.currentHp > pokemon.maxHp * 0.5
                                    ? "bg-green-500"
                                    : pokemon.currentHp > pokemon.maxHp * 0.25
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${
                                    (pokemon.currentHp / pokemon.maxHp) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white/80 mb-2">Opponent Team</h5>
                    <div className="space-y-2">
                      {battleState.botTeam.map((pokemon, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-2 rounded-lg ${
                            index === battleState.currentBotPokemon
                              ? "bg-red-500/20"
                              : "bg-white/5"
                          }`}
                        >
                          <img
                            src={pokemon.spriteDefault}
                            alt={pokemon.name}
                            className="w-8 h-8 mr-2"
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm capitalize">
                              {pokemon.name}
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  pokemon.currentHp > pokemon.maxHp * 0.5
                                    ? "bg-green-500"
                                    : pokemon.currentHp > pokemon.maxHp * 0.25
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${
                                    (pokemon.currentHp / pokemon.maxHp) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h4 className="text-lg font-bold text-white mb-4">
                    Battle Log
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {battleState.battleLog.map((log, index) => (
                      <p key={index} className="text-white/80 text-sm">
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
