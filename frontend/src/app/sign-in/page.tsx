"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [randomPokemon, setRandomPokemon] = useState<any>(null);

  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  const fetchRandomPokemon = async () => {
    try {
      // Get a random Pokemon ID between 1 and 1025
      const randomId = Math.floor(Math.random() * 1025) + 1;
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${randomId}`
      );

      if (response.ok) {
        const pokemonData = await response.json();
        setRandomPokemon(pokemonData);
      }
    } catch (error) {
      console.error("Failed to fetch random Pokemon:", error);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "✅ Magic link sent! Check your email and click the link to sign in."
        );

        // In development, show the magic link in console
        if (data.magicLink) {
          console.log("🔗 Development Magic Link:", data.magicLink);
          setMessage((prev) => prev + " (Check console for development link)");
        }
      } else {
        setError(data.error || "Failed to send magic link");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-16 flex-col justify-center relative overflow-hidden">
        {randomPokemon && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="relative">
              <img
                src={
                  randomPokemon.sprites?.other?.showdown?.front_default ||
                  randomPokemon.sprites?.other?.["official-artwork"]
                    ?.front_default ||
                  randomPokemon.sprites?.front_default
                }
                alt={randomPokemon.name}
                className="w-72 h-72 object-contain animate-bounce"
                style={{ animationDuration: "3s" }}
              />
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto text-center relative z-10">
          <div className="mb-8">
            <Link href="/" className="text-white text-4xl font-bold">
              ⚡ PokéDeck
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6">
            Welcome Back, Trainer!
          </h2>
          <p className="text-gray-200 text-lg mb-8">
            Enter your email to receive a magic link and sign in securely to
            your PokéDeck account.
          </p>

          <div className="space-y-4 text-left">
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>No passwords required</span>
            </div>
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Secure email-based sign-in</span>
            </div>
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Build amazing Pokémon decks</span>
            </div>
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Draw 20 cards daily</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-12">
        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-4xl font-bold text-gray-800">
              ⚡ PokéDeck
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
            <p className="text-gray-600">
              Enter your email to receive a magic link
            </p>
          </div>

          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="trainer@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-gray-500 placeholder:font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl hover:from-yellow-500 hover:to-orange-600 active:from-yellow-600 active:to-orange-700 active:scale-95 transition-all duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending Magic Link...
                </>
              ) : (
                <>✨ Send Magic Link</>
              )}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Enter your email address</li>
              <li>2. Check your email for the magic link</li>
              <li>3. Click the link to sign in securely</li>
              <li>4. Start building your Pokémon deck!</li>
            </ol>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
