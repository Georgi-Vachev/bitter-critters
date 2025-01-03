import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import CardsTable from "./pixiComponents/CardsTable";
import ChoiceScreen from "./pixiComponents/ChoiceScreen";
import PicksArea from "./pixiComponents/PicksArea";
import Card from "./pixiComponents/Card";
import Transition from "./pixiComponents/Transition";
import BattleField from "./pixiComponents/BattleField";

const landscapeWidth = 2560;
const landscapeHeight = 1440;
const portraitWidth = 1440;
const portraitHeight = 2560;

export default class PixiApp {
    protected _app: PIXI.Application | null = null;
    protected _cardsTable!: CardsTable;
    protected _choiceScreen!: ChoiceScreen;
    protected _picksArea!: PicksArea;
    protected _transition!: Transition;
    protected _battleField!: BattleField;
    protected _themes: Array<Theme> = [];
    protected _currentTheme!: Theme;
    protected _orientation: "landscape" | "portrait" = "landscape";
    protected _battleInProgress: boolean = false;

    constructor() {
        this._app = new PIXI.Application();
    }

    public async init(options: { width: number; height: number; backgroundColor: number }): Promise<void> {
        if (!this._app) throw new Error('PIXI Application instance is not initialized.');
        await this._app.init(options);

        (globalThis as any).__PIXI_APP__ = this._app;

        const response = await fetch("/Config.json");
        const config = await response.json();

        this._themes = config.themes;
        this._currentTheme = this._themes[Math.floor(Math.random() * this._themes.length)];

        window.addEventListener("resize", this.resizeCanvas.bind(this));

        this._app.stage.interactive = true;
        this._app.stage.hitArea = new PIXI.Rectangle(0, 0, this._app.renderer.width, this._app.renderer.height);

        this.resizeCanvas();

        this._cardsTable = new CardsTable(this._app, this.onCardPick.bind(this));
        await this._cardsTable.init();

        this._picksArea = new PicksArea(this.addRandomCard.bind(this), this.onBattleStart.bind(this));
        this._choiceScreen = new ChoiceScreen(this._app);
        this._battleField = new BattleField(this._app, this._picksArea, this._currentTheme);
        this._transition = new Transition(this._app, this._battleField, this._currentTheme);

        this._app.stage.addChild(this._cardsTable, this._battleField, this._transition, this._picksArea, this._choiceScreen);
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
            gsap.globalTimeline.clear();
            this._app.destroy(true, { children: true });
            this._app = null;
        }
    }

    protected resizeCanvas = () => {
        if (!this._app) return;
        const isPortrait = window.innerHeight > window.innerWidth;
        if (this._orientation !== (isPortrait ? "portrait" : "landscape")) {
            if (isPortrait) {
                this._app.renderer.resize(portraitWidth, portraitHeight);
                this._app.stage.angle = 90;
                this._app.stage.position.x = portraitWidth;
            } else {
                this._app.renderer.resize(landscapeWidth, landscapeHeight);
                this._app.stage.angle = 0;
                this._app.stage.position.x = 0;
            }
            this._orientation = isPortrait ? "portrait" : "landscape";
        }

        const scaleX = (window.innerWidth / 1.1) / this._app.renderer.width;
        const scaleY = (window.innerHeight / 1.1) / this._app.renderer.height;
        const scale = Math.min(scaleX, scaleY);

        this._app.view.style.width = `${this._app.renderer.width * scale}px`;
        this._app.view.style.height = `${this._app.renderer.height * scale}px`;

        this._orientation = isPortrait ? "portrait" : "landscape";
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
                this._picksArea.addCard(card, "right");
            },
            (name: string) => {
                console.log(`Fight with: ${name}`);
                this._picksArea.addCard(card, "left");
            }
        );
    }

    protected addRandomCard(side: "left" | "right"): void {
        const card = this._cardsTable.cards[Math.floor(Math.random() * this._cardsTable.cards.length)];

        this._picksArea.addCard(card, side);
    }

    protected async onBattleStart(): Promise<void> {
        if (this._battleInProgress) return;
        this._battleInProgress = true

        await Promise.all([
            this._picksArea.animateIntro(),
            this._cardsTable.animateIntro()
        ]);

        const { leftCardSprite, rightCardSprite } = this._picksArea.chosenCardSprites;

        this._transition.animateIntro(leftCardSprite!, rightCardSprite!);
    }

}
