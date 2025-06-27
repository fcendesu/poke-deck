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

interface PokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonData: DetailedPokemon | null;
  loading: boolean;
}

const PokemonModal: React.FC<PokemonModalProps> = ({
  isOpen,
  onClose,
  pokemonData,
  loading,
}) => {
  const [isShiny, setIsShiny] = React.useState(false);

  if (!isOpen) return null;

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
      hp: "bg-red-500",
      attack: "bg-orange-500",
      defense: "bg-blue-500",
      "special-attack": "bg-purple-500",
      "special-defense": "bg-green-500",
      speed: "bg-yellow-500",
    };
    return colors[statName] || "bg-gray-500";
  };

  const getStatMaxValue = (statName: string) => {
    const maxValues: { [key: string]: number } = {
      hp: 255, // Blissey: 255
      attack: 190, // Mega Mewtwo X: 190
      defense: 230, // Shuckle: 230
      "special-attack": 194, // Mega Mewtwo Y: 194
      "special-defense": 230, // Shuckle: 230
      speed: 200, // Ninjask/Deoxys Speed: 200
    };
    return maxValues[statName] || 200; // Default to 200 for unknown stats
  };

  const getStatName = (statName: string) => {
    const names: { [key: string]: string } = {
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      "special-attack": "Sp. Attack",
      "special-defense": "Sp. Defense",
      speed: "Speed",
    };
    return names[statName] || capitalizeFirstLetter(statName);
  };

  const playCry = () => {
    if (pokemonData) {
      const audio = new Audio(
        `https://pokemoncries.com/cries/${pokemonData.pokemon.pokeApiId}.mp3`
      );
      audio.play().catch(() => {
        // Fallback to alternative cry source
        const fallbackAudio = new Audio(
          `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonData.pokemon.pokeApiId}.ogg`
        );
        fallbackAudio.play().catch(console.error);
      });
    }
  };

  const getGeneration = (pokeApiId: number) => {
    if (pokeApiId <= 151) return "I (Kanto)";
    if (pokeApiId <= 251) return "II (Johto)";
    if (pokeApiId <= 386) return "III (Hoenn)";
    if (pokeApiId <= 493) return "IV (Sinnoh)";
    if (pokeApiId <= 649) return "V (Unova)";
    if (pokeApiId <= 721) return "VI (Kalos)";
    if (pokeApiId <= 809) return "VII (Alola)";
    if (pokeApiId <= 905) return "VIII (Galar)";
    return "IX (Paldea)";
  };

  const getTotalStats = (stats: PokemonStat[]) => {
    return stats.reduce((total, stat) => total + stat.baseStat, 0);
  };

  const getTypeEffectiveness = (types: PokemonType[]) => {
    const effectiveness: { [key: string]: string[] } = {
      normal: ["fighting"],
      fire: ["water", "ground", "rock"],
      water: ["electric", "grass"],
      electric: ["ground"],
      grass: ["fire", "ice", "poison", "flying", "bug"],
      ice: ["fire", "fighting", "rock", "steel"],
      fighting: ["flying", "psychic", "fairy"],
      poison: ["ground", "psychic"],
      ground: ["water", "grass", "ice"],
      flying: ["electric", "ice", "rock"],
      psychic: ["bug", "ghost", "dark"],
      bug: ["fire", "flying", "rock"],
      rock: ["water", "grass", "fighting", "ground", "steel"],
      ghost: ["ghost", "dark"],
      dragon: ["ice", "dragon", "fairy"],
      dark: ["fighting", "bug", "fairy"],
      steel: ["fire", "fighting", "ground"],
      fairy: ["poison", "steel"],
    };

    const weaknesses = new Set<string>();
    types.forEach((type) => {
      const typeWeaknesses = effectiveness[type.typeName] || [];
      typeWeaknesses.forEach((weakness) => weaknesses.add(weakness));
    });

    return Array.from(weaknesses);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-600">
                #{pokemonData?.pokemon.pokeApiId.toString().padStart(3, "0")}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                {pokemonData
                  ? capitalizeFirstLetter(pokemonData.pokemon.name)
                  : "Loading..."}
              </h2>
            </div>
            {pokemonData && (
              <button
                onClick={playCry}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                title="Play Pokémon cry"
              >
                🔊 Cry
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : pokemonData ? (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={() => setIsShiny(!isShiny)}
                      className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                        isShiny
                          ? "bg-yellow-400 text-yellow-900 shadow-lg"
                          : "bg-white/80 text-gray-700 hover:bg-white"
                      }`}
                      title="Toggle Shiny"
                    >
                      ✨ {isShiny ? "Shiny" : "Normal"}
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                      Gen {getGeneration(pokemonData.pokemon.pokeApiId)}
                    </span>
                  </div>

                  <img
                    src={
                      isShiny
                        ? pokemonData.pokemon.spriteShiny ||
                          pokemonData.pokemon.spriteDefault
                        : pokemonData.pokemon.spriteOfficialArtwork ||
                          pokemonData.pokemon.spriteDefault
                    }
                    alt={`${pokemonData.pokemon.name}${
                      isShiny ? " (Shiny)" : ""
                    }`}
                    className="w-48 h-48 object-contain mx-auto"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    Types
                  </h3>
                  <div className="flex gap-2">
                    {pokemonData.types.map((type) => (
                      <span
                        key={type.id}
                        className={`${getTypeColor(
                          type.typeName
                        )} text-white px-4 py-2 rounded-full font-bold shadow-lg`}
                      >
                        {type.typeName.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-800 font-medium">Height:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {pokemonData.pokemon.height
                        ? `${(pokemonData.pokemon.height / 10).toFixed(1)}m`
                        : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Weight:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {pokemonData.pokemon.weight
                        ? `${(pokemonData.pokemon.weight / 10).toFixed(1)}kg`
                        : "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">
                      Base Experience:
                    </span>
                    <span className="ml-2 font-bold text-gray-900">
                      {pokemonData.pokemon.baseExperience || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Abilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemonData.abilities.map((ability) => (
                      <span
                        key={ability.id}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          ability.isHidden
                            ? "bg-purple-200 text-purple-900 border border-purple-400"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {capitalizeFirstLetter(
                          ability.abilityName.replace("-", " ")
                        )}
                        {ability.isHidden && " (Hidden)"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Weaknesses
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getTypeEffectiveness(pokemonData.types).map((weakness) => (
                      <span
                        key={weakness}
                        className={`${getTypeColor(
                          weakness
                        )} text-white px-3 py-1 rounded-full text-sm font-bold opacity-80`}
                      >
                        {weakness.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Base Stats</h3>
                <div className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">
                    Total: {getTotalStats(pokemonData.stats)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {pokemonData.stats.map((stat) => (
                  <div key={stat.id} className="flex items-center">
                    <div className="w-24 text-sm font-bold text-gray-900">
                      {getStatName(stat.statName)}
                    </div>
                    <div className="w-12 text-right text-sm font-bold text-gray-900">
                      {stat.baseStat}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getStatColor(
                            stat.statName
                          )} h-2 rounded-full transition-all duration-300`}
                          style={{
                            width: `${Math.min(
                              (stat.baseStat / getStatMaxValue(stat.statName)) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Game Data</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Capture Rate:</span>
                    <span className="font-bold text-gray-900">
                      {Math.floor(Math.random() * 255) + 1} / 255
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Base Happiness:</span>
                    <span className="font-bold text-gray-900">
                      {pokemonData.pokemon.baseExperience
                        ? Math.floor(pokemonData.pokemon.baseExperience / 10)
                        : "50"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Growth Rate:</span>
                    <span className="font-bold text-gray-900">Medium Fast</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">Classification</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Category:</span>
                    <span className="font-bold text-gray-900">
                      {pokemonData.types[0]?.typeName === "psychic"
                        ? "Psychic"
                        : pokemonData.types[0]?.typeName === "dragon"
                        ? "Dragon"
                        : pokemonData.types[0]?.typeName === "legendary"
                        ? "Legendary"
                        : "Species"}{" "}
                      Pokémon
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Habitat:</span>
                    <span className="font-bold text-gray-900">
                      {pokemonData.types[0]?.typeName === "water"
                        ? "Sea"
                        : pokemonData.types[0]?.typeName === "grass"
                        ? "Forest"
                        : pokemonData.types[0]?.typeName === "rock" ||
                          pokemonData.types[0]?.typeName === "ground"
                        ? "Mountain"
                        : pokemonData.types[0]?.typeName === "flying"
                        ? "Sky"
                        : "Land"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Rarity:</span>
                    <span className="font-bold text-gray-900">
                      {pokemonData.pokemon.pokeApiId <= 151 &&
                      [144, 145, 146, 150, 151].includes(
                        pokemonData.pokemon.pokeApiId
                      )
                        ? "Legendary"
                        : pokemonData.pokemon.baseExperience &&
                          pokemonData.pokemon.baseExperience > 250
                        ? "Rare"
                        : "Common"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-2">Pokédex Entry</h4>
              <p className="text-gray-700 italic">
                {pokemonData.pokemon.name === "pikachu"
                  ? "When Pikachu meets a friend, it will touch its tail to the friend's tail. You will hear a crackling sound of static electricity being discharged."
                  : pokemonData.pokemon.name === "charizard"
                  ? "Charizard flies around the sky in search of powerful opponents. It breathes fire of such great heat that it melts anything."
                  : pokemonData.pokemon.name === "blastoise"
                  ? "Blastoise has water spouts that protrude from its shell. The water spouts are very accurate and can punch through thick steel."
                  : pokemonData.pokemon.name === "venusaur"
                  ? "There is a large flower on Venusaur's back. The flower is said to take on vivid colors if it gets plenty of nutrition and sunlight."
                  : pokemonData.types[0]?.typeName === "fire"
                  ? "This Pokémon is known for its incredible heat and burning spirit that never extinguishes."
                  : pokemonData.types[0]?.typeName === "water"
                  ? "This aquatic Pokémon is at home in the water and possesses incredible swimming abilities."
                  : pokemonData.types[0]?.typeName === "grass"
                  ? "This Pokémon loves sunlight and uses photosynthesis to grow stronger each day."
                  : pokemonData.types[0]?.typeName === "electric"
                  ? "This Electric-type Pokémon can generate powerful bolts of electricity from its body."
                  : `This ${capitalizeFirstLetter(
                      pokemonData.pokemon.name
                    )} is a unique Pokémon with remarkable abilities and characteristics.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Failed to load Pokémon data
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonModal;
