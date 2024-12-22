import * as PIXI from "pixi.js";
import CardsTable from "./pixiComponents/CardsTable";
import ChoiceScreen from "./pixiComponents/ChoiceScreen";
import PickArea from "./pixiComponents/PicksArea";
import Card from "./pixiComponents/Card";

const landscapeWidth = 2560;
const landscapeHeight = 1440;
const portraitWidth = 1440;
const portraitHeight = 2560;

export default class PixiApp {
    protected _app: PIXI.Application | null = null;
    protected _cardsTable!: CardsTable;
    protected _choiceScreen!: ChoiceScreen;
    protected _arena!: PickArea;

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

        this.resizeCanvas();

        this._arena = new PickArea(this._app.renderer.width, this._app.renderer.height);
        this._choiceScreen = new ChoiceScreen(this._app);

        this._cardsTable = new CardsTable(this._app, this.onCardPick.bind(this));
        await this._cardsTable.init();

        this._app.stage.addChild(this._cardsTable, this._arena, this._choiceScreen);
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

        this._app.view.style.width = `${this._app.renderer.width * scale}px`;
        this._app.view.style.height = `${this._app.renderer.height * scale}px`;
    };

    protected onCardPick(card: Card, cardData: any): void {
        card.interactive = false;
        card.tint = 0xffffff;
        card.scale.set(1);
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
    }
}
