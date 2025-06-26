import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">⚡ PokéDeck</div>
          <div>
            <Link
              href="/sign-in"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xl px-5 py-2 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              🔑 Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Build Your Ultimate{" "}
            <span className="text-yellow-400">Pokémon Deck</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Discover, collect, and build Pokémon decks. Draw cards daily,
            complete your collection, and become the ultimate Pokémon trainer!
          </p>

          <Link
            href="/sign-in"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xl px-8 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            🎮 Start Building Your Deck
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Daily Card Draws
            </h3>
            <p className="text-gray-200">
              Draw up to 20 cards every day to expand your collection and
              complete your decks.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Deck Management
            </h3>
            <p className="text-gray-200">
              Create multiple decks, track missing cards, and organize your
              Pokémon collection.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Complete Collections
            </h3>
            <p className="text-gray-200">
              Fill your decks with rare and powerful Pokémon to become the
              ultimate trainer.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">
                1
              </div>
              <h4 className="text-white font-semibold mb-2">Sign In</h4>
              <p className="text-gray-200 text-sm">Play Now</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">
                2
              </div>
              <h4 className="text-white font-semibold mb-2">Create Decks</h4>
              <p className="text-gray-200 text-sm">Build your Pokémon decks</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">
                3
              </div>
              <h4 className="text-white font-semibold mb-2">Draw Cards</h4>
              <p className="text-gray-200 text-sm">Get 20 new cards daily</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl">
                4
              </div>
              <h4 className="text-white font-semibold mb-2">Complete</h4>
              <p className="text-gray-200 text-sm">
                Fill missing cards in your decks
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-300">
            Created by{" "}
            <a
              href="https://github.com/fcendesu"
              className="text-yellow-400 hover:text-yellow-300"
            >
              Furkan Çakmak
            </a>
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Powered by PokéAPI • Next.js • Express.js • PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
