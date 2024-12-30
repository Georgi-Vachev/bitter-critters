import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PicksArea from "./PicksArea";
import ActionBar from "./ActionBar";
import InfoBar from "./InfoBar";
export default class BattleField extends PIXI.Container {
    protected _app: PIXI.Application;
    protected _picksArea: PicksArea;
    protected _leftCardSprite!: PIXI.Sprite;
    protected _rightCardSprite!: PIXI.Sprite;
    protected _playerActionBar!: ActionBar;
    protected _enemyActionBar!: ActionBar;
    protected _infoBar!: InfoBar;
    protected _background!: PIXI.Sprite;
    protected _theme: Theme;
    protected readonly _appWidth: number = 2560;
    protected readonly _appHeight: number = 1440;

    constructor(app: PIXI.Application, picksArea: PicksArea, theme: Theme) {
        super();

        this._app = app;
        this._picksArea = picksArea;
        this._theme = theme;

        this.setupInfoBar();
        this.setupActionBars()
        this.setupBackground();
    }

    public reveal(): void {
        this._background!.visible = true;
        this._playerActionBar!.visible = true;
        this._enemyActionBar!.visible = true;
        this._infoBar!.visible = true;
    }

    public startBattle(leftCardSprite: PIXI.Sprite, rightCardSprite: PIXI.Sprite): void {
        this._leftCardSprite = leftCardSprite;
        this._rightCardSprite = rightCardSprite;

        this._picksArea.removeChosenCards();
        this.addChild(this._leftCardSprite, this._rightCardSprite);

        this.beginCardsIdleAnimation();

        this._playerActionBar.revealRectangle();
        this._enemyActionBar.revealRectangle();
        this._infoBar.revealRectangle();
    }

    protected beginCardsIdleAnimation(): void {
        const leftCardProps = { y: this._leftCardSprite.y, scaleX: this._leftCardSprite.scale.x, scaleY: this._leftCardSprite.scale.y };
        const rightCardProps = { y: this._rightCardSprite.y, scaleX: this._rightCardSprite.scale.x, scaleY: this._rightCardSprite.scale.y };

        gsap.to(leftCardProps, {
            y: "-=10",
            scaleX: "-=0.1",
            scaleY: "+=0.1",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
            onUpdate: () => {
                this._leftCardSprite!.y = leftCardProps.y;
                this._leftCardSprite!.scale.set(leftCardProps.scaleX, leftCardProps.scaleY);
            }
        });

        gsap.to(rightCardProps, {
            y: "-=10",
            scaleX: "+=0.1",
            scaleY: "+=0.1",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
            delay: 0.5,
            onUpdate: () => {
                this._rightCardSprite!.y = rightCardProps.y;
                this._rightCardSprite!.scale.set(rightCardProps.scaleX, rightCardProps.scaleY);
            }
        });
    }

    protected setupBackground(): void {
        const localImagePath = `/assets/images/backgrounds/${this._theme.background}.jpg`;
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

    protected setupActionBars(): void {
        this._playerActionBar = new ActionBar("right", this._theme);
        this._enemyActionBar = new ActionBar("left", this._theme);

        this._playerActionBar.position.set(this._appWidth, 0);
        this._enemyActionBar.position.set(-this._appWidth * 0.1, 0);

        this._playerActionBar.visible = false;
        this._enemyActionBar.visible = false;

        this.addChild(this._playerActionBar, this._enemyActionBar);
    }

    protected setupInfoBar(): void {
        this._infoBar = new InfoBar(this._theme);
        this._infoBar.position.set(0, -this._appHeight * 0.15);

        this._infoBar.visible = false;

        this.addChild(this._infoBar);
    }
}
