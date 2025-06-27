"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PokemonCard from "../../components/PokemonCard";
import PokemonModal from "../../components/PokemonModal";

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

interface PokemonAbility {
  id: number;
  pokemonId: number;
  abilityName: string;
  isHidden: boolean;
  slot: number;
}

interface DetailedPokemon {
  pokemon: {
    id: number;
    pokeApiId: number;
    name: string;
    spriteDefault: string;
    spriteShiny: string;
    spriteOfficialArtwork: string;
    baseExperience?: number;
    height?: number;
    weight?: number;
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
}

interface Pokemon {
  id: number;
  pokeApiId: number;
  name: string;
  spriteDefault: string;
  spriteShiny: string;
  spriteOfficialArtwork: string;
  baseExperience?: number;
  height?: number;
  weight?: number;
  stats?: PokemonStat[];
  types?: PokemonType[];
  isOwned?: boolean;
}

interface PokemonResponse {
  pokemon: Pokemon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pokemonData, setPokemonData] = useState<PokemonResponse | null>(null);
  const [pokemonLoading, setPokemonLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] =
    useState<DetailedPokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [drawStatus, setDrawStatus] = useState<any>(null);
  const [drawResult, setDrawResult] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPokemon(currentPage);
      fetchDrawStatus();
    }
  }, [user, currentPage]);

  const checkAuth = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/auth/me`,
        {
          credentials: "include",
        }
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

  const fetchPokemon = async (page: number = 1) => {
    if (!user) return;

    setPokemonLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/pokemon?page=${page}&limit=60`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPokemonData(data);
      } else {
        console.error("Failed to fetch Pokemon");
      }
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
    } finally {
      setPokemonLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/auth/signout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const fetchPokemonDetails = async (pokeApiId: number) => {
    setModalLoading(true);
    setIsModalOpen(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/pokemon/${pokeApiId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedPokemon(data);
      } else {
        console.error("Failed to fetch Pokemon details");
        setSelectedPokemon(null);
      }
    } catch (error) {
      console.error("Error fetching Pokemon details:", error);
      setSelectedPokemon(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCardClick = (pokemon: Pokemon) => {
    if (!pokemon.isOwned) {
      return; // Simply do nothing for unowned cards
    }
    fetchPokemonDetails(pokemon.pokeApiId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  const fetchDrawStatus = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/daily-draw/status`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDrawStatus(data);
      }
    } catch (error) {
      console.error("Error fetching draw status:", error);
    }
  };

  const performDailyDraw = async () => {
    setIsDrawing(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/daily-draw`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDrawResult(data);
        fetchDrawStatus(); // Refresh draw status
        fetchPokemon(currentPage); // Refresh Pokemon list to update owned status
      }
    } catch (error) {
      console.error("Error performing draw:", error);
    } finally {
      setIsDrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            ⚡ PokéDeck
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <button
              onClick={handleSignOut}
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xl px-4 py-2 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Pokémon Collection
          </h1>
          <p className="text-gray-600">
            {pokemonData?.pagination.total || 0} Pokémon discovered
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Daily Card Draw
              </h2>
              <p className="text-gray-700">
                {drawStatus?.canDraw
                  ? `Draw ${Math.min(5, drawStatus.remainingDraws)} cards! ${
                      drawStatus.remainingDraws
                    } draws remaining today.`
                  : "Come back tomorrow for more draws!"}
              </p>
            </div>
            <button
              onClick={performDailyDraw}
              disabled={!drawStatus?.canDraw || isDrawing}
              className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-bold text-lg transition-all transform ${
                drawStatus?.canDraw && !isDrawing
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 hover:scale-105 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isDrawing ? "Drawing..." : "🎴 Draw Cards"}
            </button>
          </div>
        </div>

        {drawResult && (
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl p-8 mb-8 border-2 border-yellow-300 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {drawResult.message}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {drawResult.cardsDrawn?.map((card: any, index: number) => (
                <div
                  key={index}
                  className={`relative rounded-xl p-4 text-center transform transition-all duration-300 hover:scale-105 ${
                    card.isNewCard
                      ? "bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100 border-2 border-yellow-400 shadow-lg animate-pulse"
                      : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-md"
                  }`}
                >
                  {card.isNewCard && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce">
                      ✨ NEW!
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-2 mb-3 shadow-sm">
                    <img
                      src={card.spriteOfficialArtwork || card.spriteDefault}
                      alt={card.name}
                      className="w-20 h-20 mx-auto object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-sm capitalize text-gray-900 leading-tight">
                      {card.name}
                    </p>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        card.isNewCard
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      Qty: {card.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dismiss button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setDrawResult(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-colors"
              >
                Close Results
              </button>
            </div>
          </div>
        )}

        {pokemonLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-6">
              {pokemonData?.pokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => handleCardClick(pokemon)}
                />
              ))}
            </div>

            {pokemonData && pokemonData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {pokemonData.pagination.page} of{" "}
                  {pokemonData.pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        pokemonData.pagination.totalPages,
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage === pokemonData.pagination.totalPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <PokemonModal
        isOpen={isModalOpen}
        onClose={closeModal}
        pokemonData={selectedPokemon}
        loading={modalLoading}
      />
    </div>
  );
}
