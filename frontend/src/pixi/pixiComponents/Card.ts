import * as PIXI from 'pixi.js';
import { CardData } from '../../types/cardData';

export default class Card extends PIXI.Container {
    static readonly CARD_HOVER_SCALE = 1.05;
    static readonly CARD_IDLE_SCALE = 1;

    constructor(cardData: CardData, cardWidth: number, cardHeight: number) {
        super();
        this.createCard(cardData, cardWidth, cardHeight);
        this.addEventListeners();
    }

    protected createCard(cardData: CardData, cardWidth: number, cardHeight: number) {
        const background = new PIXI.Graphics();
        background.roundRect(0, 0, cardWidth, cardHeight, 10);
        background.fill(0x444444);
        this.addChild(background);

        const localImagePath = `/assets/images/${cardData.name.toLowerCase()}.png`;
        const img = new Image();
        img.src = localImagePath;
        img.onload = () => {
            const texture = PIXI.Texture.from(img);
            const sprite = new PIXI.Sprite(texture);
            sprite.width = 200;
            sprite.height = 200;
            sprite.position.set((cardWidth - sprite.width) / 2, 5);
            sprite.cursor = "pointer";

            this.addChild(sprite);
        };
        img.onerror = () => {
            console.error("Failed to load image:", localImagePath);
        };

        const nameText = new PIXI.Text({ text: `${cardData.name.charAt(0).toUpperCase() + cardData.name.slice(1)}`, style: { fontSize: 30, fill: 0xadd8e6, fontWeight: 'bold' } });
        nameText.anchor.set(0.5, 0);
        nameText.position.set(cardWidth / 2, 200);
        this.addChild(nameText);

        const abilityText = new PIXI.Text(`Ability: ${cardData.abilities[0]}`, { fontSize: 26, fill: 0xffffff });
        abilityText.anchor.set(0.5, 0);
        abilityText.position.set(cardWidth / 2, 260);
        this.addChild(abilityText);

        cardData.moves.slice(0, 4).forEach((move, moveIndex) => {
            const moveText = new PIXI.Text(`Move ${moveIndex + 1}: ${move}`, { fontSize: 26, fill: 0xffffff });
            moveText.anchor.set(0.5, 0);
            moveText.position.set(cardWidth / 2, 300 + moveIndex * 32);
            this.addChild(moveText);
        });

        const statsText = [
            { text: `SPD: ${cardData.stats.speed}`, color: 0xffd700 },
            { text: `DEF: ${cardData.stats.defense}`, color: 0x4682b4 },
            { text: `ATK: ${cardData.stats.attack}`, color: 0xc25c2d },
            { text: `HP: ${cardData.stats.hp}`, color: 0x2dc254 },
        ];
        statsText.forEach((stat, statIndex) => {
            const statText = new PIXI.Text(stat.text, { fontSize: 26, fill: stat.color });
            statText.anchor.set(0.5, 0);
            statText.position.set(cardWidth / 2, 440 + statIndex * 32);
            this.addChild(statText);
        });

        this.pivot.set(cardWidth / 2, cardHeight / 2);
    }

    protected addEventListeners() {
        this.on("pointerover", () => {
            this.tint = 0xdddddd;
            this.scale.set(Card.CARD_HOVER_SCALE);
        });

        this.on("pointerout", () => {
            this.tint = 0xffffff;
            this.scale.set(Card.CARD_IDLE_SCALE);
        });
    }
}
