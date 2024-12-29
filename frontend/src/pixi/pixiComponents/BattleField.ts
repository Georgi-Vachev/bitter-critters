import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PicksArea from "./PicksArea";
import ActionBar from "./ActionBar";
export default class BattleField extends PIXI.Container {
    protected _app: PIXI.Application;
    protected _picksArea: PicksArea;
    protected _leftCardSprite: PIXI.Sprite | null = null;
    protected _rightCardSprite: PIXI.Sprite | null = null;
    protected _playerActionBar: ActionBar | null = null;
    protected _enemyActionBar: ActionBar | null = null;
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

        this.setupActionBars()
        this.setupBackground();
    }

    public reveal(): void {
        this._background!.visible = true;
        this._playerActionBar!.visible = true;
        this._enemyActionBar!.visible = true;
    }

    public startBattle(leftCardSprite: PIXI.Sprite, rightCardSprite: PIXI.Sprite): void {
        this._leftCardSprite = leftCardSprite;
        this._rightCardSprite = rightCardSprite;

        this._picksArea.removeChosenCards();
        this.addChild(this._leftCardSprite, this._rightCardSprite);

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

        gsap.to(this._playerActionBar!.position, {
            x: this._playerActionBar!.x - this._playerActionBar!.width,
            duration: 1,
            ease: "bounce.out",
            onComplete: () => {
                this._playerActionBar!.revealTriangleButtons();
            },
        });

        gsap.to(this._enemyActionBar!.position, {
            x: 0,
            duration: 1,
            ease: "bounce.out",
            onComplete: () => {
                this._enemyActionBar!.revealTriangleButtons();
            },
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

    protected setupActionBars(): void {
        this._playerActionBar = new ActionBar(this._appWidth, this._appHeight, "right");
        this._enemyActionBar = new ActionBar(this._appWidth, this._appHeight, "left");

        this._playerActionBar.position.set(this._appWidth, 0);
        this._enemyActionBar.position.set(-this._appWidth * 0.1, 0);

        this._playerActionBar.visible = false;
        this._enemyActionBar.visible = false;

        this.addChild(this._playerActionBar, this._enemyActionBar);
    }

    protected revealTriangles(actionBar: ActionBar): void {
        const { top, bottom } = actionBar.getTriangles();

        gsap.fromTo(
            [top, bottom],
            { alpha: 0 },
            { alpha: 1, duration: 0.5, stagger: 0.2 }
        );
    }
}
