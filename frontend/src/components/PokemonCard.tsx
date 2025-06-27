import React from "react";

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

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
      hp: "text-red-600",
      attack: "text-orange-600",
      defense: "text-blue-600",
      "special-attack": "text-purple-600",
      "special-defense": "text-green-600",
      speed: "text-yellow-600",
    };
    return colors[statName] || "text-gray-600";
  };

  const getStatAbbreviation = (statName: string) => {
    const abbreviations: { [key: string]: string } = {
      hp: "HP",
      attack: "ATK",
      defense: "DEF",
      "special-attack": "SPA",
      "special-defense": "SPD",
      speed: "SPE",
    };
    return abbreviations[statName] || statName.toUpperCase();
  };

  const getTypeColor = (typeName: string) => {
    const typeColors: { [key: string]: string } = {
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
    return typeColors[typeName] || "bg-gray-400";
  };

  return (
    <div
      className={`${
        pokemon.isOwned === false ? "opacity-60 saturate-0 brightness-75" : ""
      } bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer group ${
        onClick ? "hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {pokemon.types && pokemon.types.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {pokemon.types.map((type) => (
              <span
                key={type.id}
                className={`${getTypeColor(
                  type.typeName
                )} text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm ${
                  pokemon.isOwned === false ? "opacity-60" : ""
                }`}
              >
                {type.typeName.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center h-32 mt-6">
          <img
            src={
              pokemon.spriteOfficialArtwork ||
              pokemon.spriteDefault ||
              "/api/placeholder/96/96"
            }
            alt={pokemon.name}
            className="w-32 h-32 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/api/placeholder/96/96";
            }}
          />
        </div>
      </div>

      <div className="p-3">
        <h3
          className={`text-base font-bold text-center group-hover:text-blue-600 transition-colors mb-2 ${
            pokemon.isOwned === false ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {capitalizeFirstLetter(pokemon.name)}
        </h3>

        {pokemon.stats &&
          pokemon.stats.length > 0 &&
          pokemon.isOwned !== false && (
            <div className="grid grid-cols-3 gap-1 text-xs">
              {pokemon.stats.slice(0, 6).map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className={`font-bold ${getStatColor(stat.statName)}`}>
                    {getStatAbbreviation(stat.statName)}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    {stat.baseStat}
                  </div>
                </div>
              ))}
            </div>
          )}

        {(pokemon.height || pokemon.weight) && pokemon.isOwned !== false && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {pokemon.height && (
              <span>H: {(pokemon.height / 10).toFixed(1)}m</span>
            )}
            {pokemon.weight && (
              <span>W: {(pokemon.weight / 10).toFixed(1)}kg</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
