interface Stats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialAttack: number;
    specialDefense: number;
}

export interface CardData {
    id: number;
    name: string;
    spriteUrl: string;
    stats: Stats;
    abilities: string[];
    moves: string[];
}
