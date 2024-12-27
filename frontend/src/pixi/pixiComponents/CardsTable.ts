import * as PIXI from "pixi.js";
import axios from "axios";
import Card from "./Card";
import gsap from "gsap";

const POKEAPI_URLS = Array.from({ length: 30 }, (_, i) => `https://pokeapi.co/api/v2/pokemon/${i + 1}/`);

export default class CardsTable extends PIXI.Container {
    protected _cards: Array<Card> = [];
    protected _cardsInfo: Array<any> = [];
    protected _scrollOffset: number = 0;
    protected _maxScroll: number = 0;
    protected _isDragging: boolean = false;
    protected _dragStartY: number = 0;
    protected _app: PIXI.Application;
    protected _cardColumns: Array<Array<Card>> = [];
    protected _onCardPick: (card: Card, cardData: any) => void;

    get cards(): Array<Card> {
        return this._cards;
    }

    constructor(app: PIXI.Application, onCardPick: (card: Card, cardData: any) => void) {
        super()
        this._app = app;
        this._onCardPick = onCardPick;

        this._app.stage.on("pointerdown", this.onDragStart.bind(this));
        this._app.stage.on("pointermove", this.onDragMove.bind(this));
        this._app.stage.on("pointerup", this.onDragEnd.bind(this));
        this._app.stage.on("pointerupoutside", this.onDragEnd.bind(this));
        this._app.stage.on("wheel", (event: WheelEvent) => this.handleScroll(event));
    }

    public async init(): Promise<void> {
        await this.fetchCardsInfo();
        this.createCards();
        this.adjustPosition();
        this.calculateMaxScroll();
    }

    public animateIntro() {
        this._cardColumns.forEach((column, columnIndex) => {
            const direction = columnIndex % 2 === 0 ? this.height : -this.height;
            column.forEach((card) => {
                gsap.to(card, {
                    y: direction,
                    duration: 1.5,
                    ease: "back.inOut",
                    onComplete: () => {
                        card.visible = false
                    }
                });
            });
        });
    }

    protected async fetchCardsInfo() {
        try {
            const responses = await Promise.all(POKEAPI_URLS.map((url) => axios.get(url)));
            const data = responses.map((response) => response.data);
            this._cardsInfo = data.map((cardData: any) => ({
                id: cardData.id,
                name: cardData.name,
                spriteUrl: cardData.sprites.front_default,
                stats: {
                    hp: cardData.stats[0].base_stat,
                    attack: cardData.stats[1].base_stat,
                    defense: cardData.stats[2].base_stat,
                    specialAttack: cardData.stats[3].base_stat,
                    specialDefense: cardData.stats[4].base_stat,
                    speed: cardData.stats[5].base_stat,
                },
                abilities: cardData.abilities.map((ability: any) => ability.ability.name),
                moves: cardData.moves.map((move: any) => move.move.name),
            }));
        } catch (error) {
            console.error("Error fetching Pokémon data:", error);
        }
    }

    protected createCards() {
        this._cardsInfo.forEach((cardData) => {
            const card = new Card(cardData, 450, 580);
            this.addChild(card);
            this._cards.push(card);

            card.interactive = true;
            card.on("pointerdown", () => this._onCardPick(card, cardData));
        });
    }

    public adjustPosition() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const margin = isPortrait ? 22 : 50;
        const cardWidth = 450;
        const cardHeight = 580;
        const portraitWidth = 1440;
        const landscapeWidth = 2560;

        let x = margin;
        let y = margin;

        const cardsPerRow = Math.floor((isPortrait ? portraitWidth : landscapeWidth) / (cardWidth + margin));
        this._cardColumns = Array.from({ length: cardsPerRow }, () => []);

        this._cards.forEach((card, index) => {
            card.position.set(x + card.width / 2, y + card.height / 2);

            const columnIndex = index % cardsPerRow;
            this._cardColumns[columnIndex].push(card);

            x += cardWidth + margin;
            if (x + cardWidth > (isPortrait ? portraitWidth : landscapeWidth) - margin) {
                x = margin;
                y += cardHeight + margin;
            }
        });

        this.y = 0;
    }

    protected calculateMaxScroll() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const margin = isPortrait ? 22 : 50;
        const cardWidth = 450;
        const cardHeight = 580;
        const portraitWidth = 1440;
        const landscapeWidth = 2560;
        const portraitHeight = 2560;
        const landscapeHeight = 1440;

        const rows = Math.ceil(this._cards.length / Math.floor((isPortrait ? portraitWidth : landscapeWidth) / (cardWidth + margin)));
        const totalHeight = rows * (cardHeight + margin);
        const visibleHeight = isPortrait ? portraitHeight : landscapeHeight;

        this._maxScroll = Math.max(0, totalHeight - visibleHeight + margin);
    }

    protected onDragStart(event: PIXI.FederatedPointerEvent): void {
        this._isDragging = true;
        this._dragStartY = event.data.global.y;
    }

    protected onDragMove(event: PIXI.FederatedPointerEvent): void {
        if (!this._isDragging) return;

        const currentY = event.data.global.y;
        const deltaY = currentY - this._dragStartY;

        this._dragStartY = currentY;

        this._scrollOffset = Math.min(Math.max(this._scrollOffset - deltaY, 0), this._maxScroll);
        this.y = -this._scrollOffset;
    }

    protected onDragEnd(): void {
        this._isDragging = false;
    }

    protected handleScroll(event: WheelEvent): void {
        const deltaY = event.deltaY;
        const scrollSpeed = 4;

        this._scrollOffset += deltaY * scrollSpeed;
        this._scrollOffset = Math.min(Math.max(this._scrollOffset, 0), this._maxScroll);

        this.y = -this._scrollOffset;
    }
}
