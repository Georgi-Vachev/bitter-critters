import * as PIXI from "pixi.js";
import axios from "axios";
import PokemonCard from "./pixiComponents/PokemonCard";

const POKEAPI_URLS = Array.from({ length: 30 }, (_, i) => `https://pokeapi.co/api/v2/pokemon/${i + 1}/`);

let canvas: HTMLCanvasElement

const landscapeWidth = 2560
const landscapeHeight = 1440
const portraitWidth = 1440
const portraitHeight = 2560
const cardWidth = 450
const cardHeight = 580

export class PixiApp {
    protected app: PIXI.Application | null = null;
    protected overlay: PIXI.Graphics | null = null;
    protected cardsInfo: Array<any> = [];
    protected cards: Array<PIXI.Container> = [];
    protected scrollOffset: number = 0;
    protected maxScroll: number = 0;
    protected isDragging: boolean = false;
    protected dragStartY: number = 0;
    protected cardsContainer: PIXI.Container | null = null;

    constructor() {
        this.app = new PIXI.Application();
    }

    public async init(options: { width: number; height: number; backgroundColor: number }): Promise<void> {
        if (!this.app) throw new Error('PIXI Application instance is not initialized.');
        await this.app.init(options);

        (globalThis as any).__PIXI_APP__ = this.app;

        window.addEventListener("resize", this.resizeCanvas.bind(this));

        canvas = this.app.canvas;

        this.resizeCanvas();
        this.addOverlay();
        this.addCards();
    }

    public attach(container: HTMLDivElement | null): void {
        if (!this.app) throw new Error('PIXI Application instance is not initialized.');
        if (container && !container.contains(this.app.canvas)) {
            container.appendChild(this.app.canvas);
        }
    }

    public detach(container: HTMLDivElement | null): void {
        if (!this.app) throw new Error('PIXI Application instance is not initialized.');
        if (container && container.contains(this.app.canvas)) {
            container.removeChild(this.app.canvas);
        }
    }

    public destroy(): void {
        if (this.app) {
            this.app.destroy(true, { children: true });
            this.app = null;
        }
    }

    protected addOverlay() {
        if (!this.app) return;

        this.overlay = new PIXI.Graphics();

        this.overlay.rect(0, 0, this.app.renderer.width, this.app.renderer.height);
        this.overlay.fill({ color: 0x000000, alpha: 0 });

        this.overlay.interactive = true;
        this.overlay.cursor = "pointer";

        this.overlay.on("pointerdown", this.onDragStart.bind(this));
        this.overlay.on("pointermove", this.onDragMove.bind(this));
        this.overlay.on("pointerup", this.onDragEnd.bind(this));
        this.overlay.on("pointerupoutside", this.onDragEnd.bind(this));
        this.overlay.on("wheel", this.handleScroll.bind(this));

        this.app.stage.addChild(this.overlay);
    }

    protected onDragStart(event: PIXI.FederatedPointerEvent): void {
        this.isDragging = true;
        this.dragStartY = event.data.global.y;
    }

    protected onDragMove(event: PIXI.FederatedPointerEvent): void {
        if (!this.isDragging || !this.cardsContainer) return;

        const currentY = event.data.global.y;
        const deltaY = currentY - this.dragStartY;

        this.dragStartY = currentY;

        this.scrollOffset = Math.min(Math.max(this.scrollOffset - deltaY, 0), this.maxScroll);

        this.cardsContainer.y = -this.scrollOffset;
    }

    protected onDragEnd(): void {
        this.isDragging = false;
    }

    protected handleScroll(event: WheelEvent): void {
        const deltaY = event.deltaY;
        const scrollSpeed = 4;

        this.scrollOffset += deltaY * scrollSpeed;
        this.scrollOffset = Math.min(Math.max(this.scrollOffset, 0), this.maxScroll);

        if (this.cardsContainer) {
            this.cardsContainer.y = -this.scrollOffset;
        }
    }

    protected resizeCanvas = () => {
        if (!this.app) return;

        const isPortrait = window.innerHeight > window.innerWidth;

        if (isPortrait) {
            this.app.renderer.resize(portraitWidth, portraitHeight);
        } else {
            this.app.renderer.resize(landscapeWidth, landscapeHeight);
        }

        const scaleX = (window.innerWidth / 1.1) / this.app.renderer.width;
        const scaleY = (window.innerHeight / 1.1) / this.app.renderer.height;
        const scale = Math.min(scaleX, scaleY);

        canvas = this.app.canvas;
        canvas.style.width = `${this.app.renderer.width * scale}px`;
        canvas.style.height = `${this.app.renderer.height * scale}px`;

        if (this.overlay) {
            this.overlay.clear();
            this.overlay.fill(0x000000, 0);
            this.overlay.rect(0, 0, this.app.renderer.width, this.app.renderer.height);
        }
    };

    protected addCards() {
        this.cardsContainer = new PIXI.Container();
        this.app?.stage.addChild(this.cardsContainer);

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
            this.cardsInfo.push(...pokemonData);
        } catch (error) {
            console.error("Error fetching Pokémon data:", error);
        }
    };

    protected calculateMaxScroll() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const margin = isPortrait ? 22 : 50;

        const rows = Math.ceil(this.cards.length / Math.floor((isPortrait ? portraitWidth : landscapeWidth) / (cardWidth + margin)));
        const totalHeight = rows * (cardHeight + margin);

        const visibleHeight = isPortrait ? portraitHeight : landscapeHeight;

        this.maxScroll = Math.max(0, totalHeight - visibleHeight + margin);
    }

    protected createCards() {
        this.cardsInfo.forEach((pokemon) => {
            const card = PokemonCard(pokemon, cardWidth, cardHeight);
            this.cardsContainer?.addChild(card);
            this.cards.push(card);
        });
    }

    protected positionCards() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const margin = isPortrait ? 22 : 50;

        let x = margin;
        let y = margin;

        this.cards.forEach((card) => {
            card.position.set(x, y);

            x += cardWidth + margin;
            if (x + cardWidth > (isPortrait ? portraitWidth : landscapeWidth) - margin) {
                x = margin;
                y += cardHeight + margin;
            }
        });

        if (this.cardsContainer) {
            this.cardsContainer.y = 0;
        }
    }
}
