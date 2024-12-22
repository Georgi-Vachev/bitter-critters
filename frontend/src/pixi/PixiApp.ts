import * as PIXI from "pixi.js";
import axios from "axios";
import Card from "./pixiComponents/Card";
import ChoiceScreen from "./pixiComponents/ChoiceScreen";
import PickArea from "./pixiComponents/PicksArea";

const POKEAPI_URLS = Array.from({ length: 30 }, (_, i) => `https://pokeapi.co/api/v2/pokemon/${i + 1}/`);

let canvas: HTMLCanvasElement

const landscapeWidth = 2560
const landscapeHeight = 1440
const portraitWidth = 1440
const portraitHeight = 2560
const cardWidth = 450
const cardHeight = 580
const cardMarginPortrait = 22
const cardMarginLandscape = 50

export default class PixiApp {
    protected _app: PIXI.Application | null = null;
    protected _cardsInfo: Array<any> = [];
    protected _cards: Array<PIXI.Container> = [];
    protected _scrollOffset: number = 0;
    protected _maxScroll: number = 0;
    protected _isDragging: boolean = false;
    protected _dragStartY: number = 0;
    protected _cardsContainer: PIXI.Container | null = null;
    protected _choiceScreen!: ChoiceScreen;
    protected _arena!: PickArea;
    protected _pickedCard!: PIXI.Container
    protected _fightCard!: PIXI.Container

    constructor() {
        this._app = new PIXI.Application();
    }

    public async init(options: { width: number; height: number; backgroundColor: number }): Promise<void> {
        if (!this._app) throw new Error('PIXI Application instance is not initialized.');
        await this._app.init(options);

        (globalThis as any).__PIXI_APP__ = this._app;

        window.addEventListener("resize", this.resizeCanvas.bind(this));

        this._app.stage.interactive = true;
        this._app.stage.hitArea = new PIXI.Rectangle(0, 0, this._app.renderer.width, this._app.renderer.height);

        this._app.stage.on("pointerdown", this.onDragStart.bind(this));
        this._app.stage.on("pointermove", this.onDragMove.bind(this));
        this._app.stage.on("pointerup", this.onDragEnd.bind(this));
        this._app.stage.on("pointerupoutside", this.onDragEnd.bind(this));

        this._app.stage.on("wheel", (event: WheelEvent) => {
            this.handleScroll(event);
        });

        canvas = this._app.canvas;

        this.resizeCanvas();
        this.addCards();

        this._arena = new PickArea(this._app.renderer.width, this._app.renderer.height);
        this._choiceScreen = new ChoiceScreen(this._app);
        this._app.stage.addChild(this._arena, this._choiceScreen)
    }

    public attach(container: HTMLDivElement | null): void {
        if (!this._app) throw new Error('PIXI Application instance is not initialized.');
        if (container && !container.contains(this._app.canvas)) {
            container.appendChild(this._app.canvas);
        }
    }

    public detach(container: HTMLDivElement | null): void {
        if (!this._app) throw new Error('PIXI Application instance is not initialized.');
        if (container && container.contains(this._app.canvas)) {
            container.removeChild(this._app.canvas);
        }
    }

    public destroy(): void {
        if (this._app) {
            this._app.destroy(true, { children: true });
            this._app = null;
        }
    }

    protected onDragStart(event: PIXI.FederatedPointerEvent): void {
        this._isDragging = true;
        this._dragStartY = event.data.global.y;
    }

    protected onDragMove(event: PIXI.FederatedPointerEvent): void {
        if (!this._isDragging || !this._cardsContainer) return;

        const currentY = event.data.global.y;
        const deltaY = currentY - this._dragStartY;

        this._dragStartY = currentY;

        this._scrollOffset = Math.min(Math.max(this._scrollOffset - deltaY, 0), this._maxScroll);

        this._cardsContainer.y = -this._scrollOffset;
    }

    protected onDragEnd(): void {
        this._isDragging = false;
    }

    protected handleScroll(event: WheelEvent): void {
        const deltaY = event.deltaY;
        const scrollSpeed = 4;

        this._scrollOffset += deltaY * scrollSpeed;
        this._scrollOffset = Math.min(Math.max(this._scrollOffset, 0), this._maxScroll);

        if (this._cardsContainer) {
            this._cardsContainer.y = -this._scrollOffset;
        }
    }

    protected resizeCanvas = () => {
        if (!this._app) return;

        const isPortrait = window.innerHeight > window.innerWidth;

        if (isPortrait) {
            this._app.renderer.resize(portraitWidth, portraitHeight);
        } else {
            this._app.renderer.resize(landscapeWidth, landscapeHeight);
        }

        const scaleX = (window.innerWidth / 1.1) / this._app.renderer.width;
        const scaleY = (window.innerHeight / 1.1) / this._app.renderer.height;
        const scale = Math.min(scaleX, scaleY);

        canvas.style.width = `${this._app.renderer.width * scale}px`;
        canvas.style.height = `${this._app.renderer.height * scale}px`;
    };

    protected addCards() {
        this._cardsContainer = new PIXI.Container();
        this._app?.stage.addChild(this._cardsContainer);

        this.fetchCardsInfo().then(() => {
            this.createCards();
            this.positionCards();
            this.calculateMaxScroll();
        });
    }

    protected async fetchCardsInfo() {
        try {
            const responses = await Promise.all(POKEAPI_URLS.map((url) => axios.get(url)));
            const data = responses.map((response) => response.data);
            const cardsData = data.map((cardData: any) => ({
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
            this._cardsInfo.push(...cardsData);
        } catch (error) {
            console.error("Error fetching Pokémon data:", error);
        }
    };

    protected calculateMaxScroll() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const margin = isPortrait ? cardMarginPortrait : cardMarginLandscape;

        const rows = Math.ceil(this._cards.length / Math.floor((isPortrait ? portraitWidth : landscapeWidth) / (cardWidth + margin)));
        const totalHeight = rows * (cardHeight + margin);

        const visibleHeight = isPortrait ? portraitHeight : landscapeHeight;

        this._maxScroll = Math.max(0, totalHeight - visibleHeight + margin);
    }

    protected createCards() {
        this._cardsInfo.forEach((cardData) => {
            const card = new Card(cardData, cardWidth, cardHeight);
            this._cardsContainer?.addChild(card);
            this._cards.push(card);

            card.interactive = true;

            card.on("pointerdown", () => {
                card.interactive = false;
                card.tint = 0xffffff;
                card.scale.set(Card.CARD_IDLE_SCALE)
                this._app!.stage.interactive = false;

                this._choiceScreen.show(
                    card,
                    cardData.name,
                    (name: string) => {
                        console.log(`Picked: ${name}`);
                        this._arena.addCreature(card.cardTexture, "left");
                    },
                    (name: string) => {
                        console.log(`Fight with: ${name}`);
                        this._arena.addCreature(card.cardTexture, "right");
                    }
                );
            });
        });
    }

    protected positionCards() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const margin = isPortrait ? cardMarginPortrait : cardMarginLandscape;

        let x = margin;
        let y = margin;

        this._cards.forEach((card) => {
            card.position.set(x + card.width / 2, y + card.height / 2);

            x += cardWidth + margin;
            if (x + cardWidth > (isPortrait ? portraitWidth : landscapeWidth) - margin) {
                x = margin;
                y += cardHeight + margin;
            }
        });

        if (this._cardsContainer) {
            this._cardsContainer.y = 0;
        }
    }
}
