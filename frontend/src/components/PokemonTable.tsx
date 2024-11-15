import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import axios from "axios";
import { Pokemon } from "../types/pokemon";
import PokemonCard from "./PokemonCard";

const POKEAPI_URLS = Array.from({ length: 30 }, (_, i) => `https://pokeapi.co/api/v2/pokemon/${i + 1}/`);

let canvas: HTMLCanvasElement

const landscapeWidth = 2560
const landscapeHeight = 1440
const portraitWidth = 1440
const portraitHeight = 2560
const cardWidth = 450
const cardHeight = 580

const pokemonCards: Array<PIXI.Container> = []

const PokemonTable: React.FC = () => {
    const pixiContainer = useRef<HTMLDivElement>(null);
    const app = useRef<PIXI.Application | null>(null);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    function scaleCanvas(isPortrait: boolean) {
        canvas = app.current!.canvas as HTMLCanvasElement
        let newWidth = window.innerWidth
        let newHeight = window.innerHeight
        const aspectRatio = isPortrait ? portraitWidth / portraitHeight : landscapeWidth / landscapeHeight

        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio
        } else {
            newHeight = newWidth / aspectRatio
        }

        canvas.style.width = `${newWidth}px`
        canvas.style.height = `${newHeight}px`
    }

    const resizeCanvas = () => {
        if (app.current) {
            const isPortrait = window.innerHeight > window.innerWidth
            if (isPortrait) {
                app.current.renderer.resize(portraitWidth, portraitHeight)
            } else {
                app.current.renderer.resize(landscapeWidth, landscapeHeight)
            }

            scaleCanvas(isPortrait)
            positionCards()
        }
    };

    useEffect(() => {
        const initializePixi = async () => {
            if (!app.current && pixiContainer.current) {
                app.current = new PIXI.Application();
                await app.current.init({ width: 2560, height: 1440, backgroundColor: 0x484848 });
                pixiContainer.current.appendChild(app.current?.canvas);

                (globalThis as any).__PIXI_APP__ = app.current;

                resizeCanvas()
            }
        };

        initializePixi();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (app.current) {
                app.current = null;
            }
        };
    }, []);

    function positionCards() {
        const isPortrait = window.innerHeight > window.innerWidth

        const margin = isPortrait ? 22 : 50;
        let x = margin;
        let y = margin;

        pokemonCards.forEach((card) => {
            card.position.set(x, y);

            x += cardWidth + margin;
            if (x + cardWidth > (isPortrait ? portraitWidth : landscapeWidth) - margin) {
                x = margin;
                y += cardHeight + margin;
            }
        });
    }

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

    useEffect(() => {
        if (app.current) {
            app.current.stage.removeChildren();
            pokemonCards.length = 0

            pokemons.forEach((pokemon, index) => {
                const card = PokemonCard(pokemon, cardWidth, cardHeight);
                card.interactive = true;
                app.current?.stage.addChild(card);

                pokemonCards.push(card)
            });

            positionCards()
        }
    }, [pokemons]);

    return (
        <div ref={pixiContainer}></div>
    );
};

export default PokemonTable;
