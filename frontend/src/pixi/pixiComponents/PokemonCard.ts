import * as PIXI from 'pixi.js';
import { Pokemon } from '../../types/pokemon';

const PokemonCard = (pokemon: Pokemon, cardWidth: number, cardHeight: number): PIXI.Container => {
    const card = new PIXI.Container();

    const background = new PIXI.Graphics();
    background.roundRect(0, 0, cardWidth, cardHeight, 10);
    background.fill(0x444444);
    card.addChild(background);

    const localImagePath = `/assets/images/${pokemon.name.toLowerCase()}.png`;
    const img = new Image();
    img.src = localImagePath;
    img.onload = () => {
        const texture = PIXI.Texture.from(img);
        const sprite = new PIXI.Sprite(texture);
        sprite.width = 200; // Increased width
        sprite.height = 200; // Increased height
        sprite.position.set((cardWidth - sprite.width) / 2, 5);
        sprite.cursor = "pointer";

        card.addChild(sprite);
    };
    img.onerror = () => {
        console.error("Failed to load image:", localImagePath);
    };

    const nameText = new PIXI.Text({ text: `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`, style: { fontSize: 30, fill: 0xadd8e6, fontWeight: 'bold' } }); // Changed color to light blue
    nameText.anchor.set(0.5, 0);
    nameText.position.set(cardWidth / 2, 200);
    card.addChild(nameText);

    const abilityText = new PIXI.Text(`Ability: ${pokemon.abilities[0]}`, { fontSize: 26, fill: 0xffffff }); // Increased font size
    abilityText.anchor.set(0.5, 0);
    abilityText.position.set(cardWidth / 2, 260);
    card.addChild(abilityText);

    pokemon.moves.slice(0, 4).forEach((move, moveIndex) => {
        const moveText = new PIXI.Text(`Move ${moveIndex + 1}: ${move}`, { fontSize: 26, fill: 0xffffff }); // Increased font size
        moveText.anchor.set(0.5, 0);
        moveText.position.set(cardWidth / 2, 300 + moveIndex * 32);
        card.addChild(moveText);
    });

    const statsText = [
        { text: `SPD: ${pokemon.stats.speed}`, color: 0xffd700 }, // Light Yellow
        { text: `DEF: ${pokemon.stats.defense}`, color: 0x4682b4 }, // Light Grey
        { text: `ATK: ${pokemon.stats.attack}`, color: 0xc25c2d }, // Light Red
        { text: `HP: ${pokemon.stats.hp}`, color: 0x2dc254 }, // Light Green
    ];
    statsText.forEach((stat, statIndex) => {
        const statText = new PIXI.Text(stat.text, { fontSize: 26, fill: stat.color }); // Increased font size
        statText.anchor.set(0.5, 0);
        statText.position.set(cardWidth / 2, 440 + statIndex * 32);
        card.addChild(statText);
    });

    return card;
};

export default PokemonCard;