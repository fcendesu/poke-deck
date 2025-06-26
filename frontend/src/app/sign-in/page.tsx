"use client";

import Link from "next/link";

export default function AuthPage() {
  const handleGoogleSignIn = () => {
    console.log("Google Sign In clicked");
  };

  const handleGitHubSignIn = () => {
    console.log("GitHub Sign In clicked");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <Link href="/" className="text-white text-4xl font-bold">
              ⚡ PokéDeck
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6">
            Welcome Back, Trainer!
          </h2>
          <p className="text-gray-200 text-lg mb-8">
            Sign in to continue building your ultimate Pokémon deck collection.
          </p>

          <div className="space-y-4 text-left">
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Draw 20 new cards daily</span>
            </div>
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Build multiple decks</span>
            </div>
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Track missing cards</span>
            </div>
            <div className="flex items-center text-white">
              <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-black font-bold">✓</span>
              </div>
              <span>Complete your collection</span>
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
              Choose your preferred method to continue
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl 
              shadow-sm bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:scale-95 active:shadow-sm transition-all duration-150 font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGitHubSignIn}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-800 rounded-xl shadow-sm bg-gray-800 text-white hover:bg-gray-900 hover:shadow-md active:bg-black active:scale-95 active:shadow-sm transition-all duration-150 font-medium"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 px-4 text-gray-500 text-sm">
              Secure authentication
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="text-center text-sm text-gray-500">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
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
