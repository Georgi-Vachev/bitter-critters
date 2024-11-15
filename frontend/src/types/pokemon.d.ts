interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialAttack: number;
    specialDefense: number;
}

export interface Pokemon {
    id: number;
    name: string;
    spriteUrl: string;
    stats: PokemonStats;
    abilities: string[];
    moves: string[];
}
