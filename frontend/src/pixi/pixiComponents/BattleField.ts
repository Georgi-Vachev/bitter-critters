import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PicksArea from "./PicksArea";
export default class BattleField extends PIXI.Container {
    protected _app: PIXI.Application;
    protected _picksArea: PicksArea;
    protected _leftCardSprite: PIXI.Sprite | null = null;
    protected _rightCardSprite: PIXI.Sprite | null = null;
    protected _background: PIXI.Sprite | null = null;
    protected readonly _appWidth: number;
    protected readonly _appHeight: number;

    constructor(app: PIXI.Application, picksArea: PicksArea) {
        super();

        const { width, height } = app.renderer;

        this._appWidth = width;
        this._appHeight = height;

        this._app = app;
        this._picksArea = picksArea;

        this.setupBackground();
    }

    public showBackground(): void {
        if (this._background) {
            this._background.visible = true;
        }
    }

    public startBattle(leftCardSprite: PIXI.Sprite, rightCardSprite: PIXI.Sprite): void {
        this._leftCardSprite = leftCardSprite;
        this._rightCardSprite = rightCardSprite;

        this._picksArea.removeChosenCards();
        this.addChild(this._leftCardSprite, this._rightCardSprite);

        // Animate the left card sprite to levitate
        gsap.to(this._leftCardSprite, {
            y: "-=10",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut"
        });

        // Animate the right card sprite to levitate
        gsap.to(this._rightCardSprite, {
            y: "-=10",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
            delay: 0.5
        });
    }

    protected setupBackground(): void {
        const localImagePath = `/assets/images/backgrounds/background_${Math.floor(Math.random() * 6)}.jpg`;
        const img = new Image();
        img.src = localImagePath;
        img.onload = () => {
            const texture = PIXI.Texture.from(img);
            this._background = new PIXI.Sprite(texture);
            this._background.width = this._appWidth;
            this._background.height = this._appHeight;
            this._background.position.set(0);

            this._background.visible = false;
            this.addChildAt(this._background, 0);
        };
    }
}
