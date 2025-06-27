"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PokemonCard from "../../components/PokemonCard";

interface Pokemon {
  id: number;
  pokeApiId: number;
  name: string;
  spriteDefault: string;
  spriteShiny: string;
  spriteOfficialArtwork: string;
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
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPokemon(currentPage);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            ⚡ PokéDeck
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Pokémon Collection
          </h1>
          <p className="text-gray-600">
            {pokemonData?.pagination.total || 0} Pokémon discovered
          </p>
        </div>

        {/* Pokemon Grid */}
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
                  onClick={() => {
                    console.log(`Clicked on ${pokemon.name}`);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
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
    </div>
  );
}
