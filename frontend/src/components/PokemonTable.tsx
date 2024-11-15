// src/components/PokemonTable.tsx
import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import axios from "axios";
import { Pokemon } from "../types/pokemon";

const POKEAPI_URLS = Array.from({ length: 30 }, (_, i) => `https://pokeapi.co/api/v2/pokemon/${i + 1}/`);

const PokemonTable: React.FC = () => {
    const pixiContainer = useRef<HTMLDivElement>(null);
    const app = useRef<PIXI.Application | null>(null);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    // Function to resize the PixiJS canvas
    const resizeCanvas = () => {
        if (app.current) {
            app.current.renderer.resize(window.innerWidth, window.innerHeight);
        }
    };

    // Initialize PixiJS Application
    useEffect(() => {
        const initializePixi = async () => {
            if (!app.current && pixiContainer.current) {
                app.current = new PIXI.Application();
                await app.current.init({ width: 2560, height: 1440, backgroundColor: 0x484848 });
                pixiContainer.current.appendChild(app.current?.canvas);

                (globalThis as any).__PIXI_APP__ = app.current;
            }
        };

        initializePixi();

        // Add event listener for window resize
        window.addEventListener("resize", resizeCanvas);

        // Clean up PixiJS Application and event listener on component unmount
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (app.current) {
                app.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const fetchPokemons = async () => {
            try {
                const responses = await Promise.all(POKEAPI_URLS.map((url) => axios.get(url)));
                const data = responses.map((response) => response.data);
                const pokemonData = data.map((pokemon: any) => ({
                    id: pokemon.id,
                    name: pokemon.name,
                    spriteUrl: pokemon.sprites.front_default,
                    stats: {
                        hp: pokemon.stats[0].base_stat,
                        attack: pokemon.stats[1].base_stat,
                        defense: pokemon.stats[2].base_stat,
                        specialAttack: pokemon.stats[3].base_stat,
                        specialDefense: pokemon.stats[4].base_stat,
                        speed: pokemon.stats[5].base_stat,
                    },
                    abilities: pokemon.abilities.map((ability: any) => ability.ability.name),
                    moves: pokemon.moves.map((move: any) => move.move.name),
                }));
                setPokemons(pokemonData);
            } catch (error) {
                console.error("Error fetching Pokémon data:", error);
            }
        };

        fetchPokemons();
    }, []);

    // Render Pokémon cards in the PixiJS application
    useEffect(() => {
        if (app.current) {
            // Clear any previous cards
            app.current.stage.removeChildren();

            // Layout variables
            const cardWidth = 220;
            const cardHeight = 350;
            const offsetX = 300
            const margin = 20;
            let x = margin;
            let y = margin;

            pokemons.forEach((pokemon, index) => {
                // Create a PixiJS Container for the card
                const card = new PIXI.Container();
                card.width = cardWidth;
                card.height = cardHeight;
                card.position.set(x + offsetX, y);

                // Draw a background rectangle for each card
                const background = new PIXI.Graphics();
                background.beginFill(0x444444);
                background.drawRoundedRect(0, 0, cardWidth, cardHeight, 10);
                background.endFill();
                card.addChild(background);

                // Load the Pokémon sprite
                const localImagePath = `/assets/images/${pokemon.name.toLowerCase()}.png`;
                const img = new Image();
                img.src = localImagePath;
                console.log(localImagePath);
                img.onload = () => {
                    console.error("Image loaded");
                    const texture = PIXI.Texture.from(img);
                    const sprite = new PIXI.Sprite(texture);
                    sprite.width = 128;
                    sprite.height = 128;
                    sprite.position.set((cardWidth - sprite.width) / 2, 20);
                    card.addChild(sprite);
                };
                img.onerror = () => {
                    console.error("Failed to load image:", localImagePath);
                };

                // Add Text elements for name, ability, and stats
                const nameText = new PIXI.Text(`Name: ${pokemon.name}`, { fontSize: 14, fill: 0xffffff });
                nameText.position.set(10, 150);
                card.addChild(nameText);

                const abilityText = new PIXI.Text(`Ability: ${pokemon.abilities[0]}`, { fontSize: 12, fill: 0xffffff });
                abilityText.position.set(10, 170);
                card.addChild(abilityText);

                pokemon.moves.slice(0, 4).forEach((move, moveIndex) => {
                    const moveText = new PIXI.Text(`Move ${moveIndex + 1}: ${move}`, { fontSize: 12, fill: 0xffffff });
                    moveText.position.set(10, 190 + moveIndex * 20);
                    card.addChild(moveText);
                });

                // Stats display
                const statsText = [
                    `Speed: ${pokemon.stats.speed}`,
                    `Defense: ${pokemon.stats.defense}`,
                    `Attack: ${pokemon.stats.attack}`,
                    `HP: ${pokemon.stats.hp}`,
                ];
                statsText.forEach((text, statIndex) => {
                    const statText = new PIXI.Text(text, { fontSize: 12, fill: 0xffffff });
                    statText.position.set(10, 270 + statIndex * 20);
                    card.addChild(statText);
                });

                // Add card to the PixiJS stage
                app.current?.stage.addChild(card);

                // Update x and y positions for grid layout
                x += cardWidth + margin;
                if (x + cardWidth > window.innerWidth) {
                    x = margin;
                    y += cardHeight + margin;
                }
            });
        }
    }, [pokemons]);

    return (
        <div ref={pixiContainer}></div>
    );
};

const createPokemonCard = (pokemon: Pokemon): PIXI.Container => {
    const container = new PIXI.Container();

    // Load the Pokémon sprite
    const sprite = PIXI.Sprite.from(pokemon.spriteUrl);
    sprite.width = 64;
    sprite.height = 64;
    sprite.position.set(16, 16);

    // Name Text
    const nameText = new PIXI.Text(`Name: ${pokemon.name}`, { fontSize: 14, fill: 0xffffff });
    nameText.position.set(16, 90);

    // Ability Text
    const abilityText = new PIXI.Text(`Ability: ${pokemon.abilities[0]}`, { fontSize: 12, fill: 0xffffff });
    abilityText.position.set(16, 110);

    // Moves
    pokemon.moves.slice(0, 4).forEach((move, index) => {
        const moveText = new PIXI.Text(`Move ${index + 1}: ${move}`, { fontSize: 12, fill: 0xffffff });
        moveText.position.set(16, 130 + index * 20);
        container.addChild(moveText);
    });

    // Stats
    const statsText = [
        `Speed: ${pokemon.stats.speed}`,
        `Defense: ${pokemon.stats.defense}`,
        `Attack: ${pokemon.stats.attack}`,
        `HP: ${pokemon.stats.hp}`,
    ];

    statsText.forEach((text, index) => {
        const statText = new PIXI.Text(text, { fontSize: 12, fill: 0xffffff });
        statText.position.set(16, 210 + index * 20);
        container.addChild(statText);
    });

    // Set container properties
    container.addChild(sprite, nameText, abilityText);
    container.width = 200;
    container.height = 250;
    container.interactive = true;
    container.pivot.set(0.5);
    container.position.set(16, 16);

    return container;
};

export default PokemonTable;
