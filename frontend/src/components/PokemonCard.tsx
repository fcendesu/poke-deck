import React from "react";

interface Pokemon {
  id: number;
  pokeApiId: number;
  name: string;
  spriteDefault: string;
  spriteShiny: string;
  spriteOfficialArtwork: string;
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getTypeColor = (pokemonId: number) => {
    const colors = [
      "from-green-400 to-blue-500",
      "from-red-400 to-pink-500",
      "from-yellow-400 to-orange-500",
      "from-purple-400 to-indigo-500",
      "from-blue-400 to-cyan-500",
      "from-pink-400 to-purple-500",
      "from-indigo-400 to-blue-500",
      "from-orange-400 to-red-500",
    ];
    return colors[pokemonId % colors.length];
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer group ${
        onClick ? "hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`relative bg-gradient-to-br ${getTypeColor(
          pokemon.pokeApiId
        )} p-6`}
      >
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-3 py-1 shadow-sm">
          <span className="text-xs font-bold text-gray-700">
            #{pokemon.pokeApiId.toString().padStart(3, "0")}
          </span>
        </div>
        <div className="flex justify-center items-center h-32">
          <img
            src={
              pokemon.spriteOfficialArtwork ||
              pokemon.spriteDefault ||
              "/api/placeholder/96/96"
            }
            alt={pokemon.name}
            className="w-24 h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/api/placeholder/96/96";
            }}
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 text-center group-hover:text-blue-600 transition-colors">
          {capitalizeFirstLetter(pokemon.name)}
        </h3>
      </div>
    </div>
  );
};

export default PokemonCard;
