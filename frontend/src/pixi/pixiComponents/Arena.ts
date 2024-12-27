import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PicksArea from "./PicksArea";
export default class Arena extends PIXI.Container {
    protected _app: PIXI.Application;
    protected _picksArea: PicksArea;
    protected _redPart: PIXI.Graphics;
    protected _bluePart: PIXI.Graphics;
    protected _leftCardSprite: PIXI.Sprite | null = null;
    protected _rightCardSprite: PIXI.Sprite | null = null;
    protected readonly _appWidth: number;
    protected readonly _appHeight: number;

    constructor(app: PIXI.Application, picksArea: PicksArea) {
        super();

        const { width, height } = app.renderer;

        this._appWidth = width;
        this._appHeight = height;

        this._app = app;
        this._picksArea = picksArea;

        this._redPart = new PIXI.Graphics();
        this._bluePart = new PIXI.Graphics();

        this.createIntroBackground();
    }

    public animateIntro(): void {
        const { leftCardSprite, rightCardSprite } = this._picksArea.removeChosenCards();
        this.addChild(leftCardSprite!, rightCardSprite!);

        this._leftCardSprite = leftCardSprite;
        this._rightCardSprite = rightCardSprite;

        this._redPart.visible = true;
        this._bluePart.visible = true;

        const timeline = gsap.timeline();

        timeline.to(this._redPart, {
            x: 0,
            duration: 1,
            ease: "bounce.out"
        });

        timeline.to(
            this._bluePart,
            {
                x: 0,
                duration: 1,
                ease: "bounce.out",
                onComplete: () => {
                    gsap.delayedCall(1, () => this.hideBackground());
                }
            },
            "<"
        );
    }

    protected createIntroBackground() {
        this._redPart.beginFill(0xff0000);
        this._redPart.moveTo(-this._appWidth / 2, 0);
        this._redPart.lineTo(this._appWidth * 0.6, 0);
        this._redPart.lineTo(this._appWidth * 0.4, this._appHeight);
        this._redPart.lineTo(-this._appWidth / 2, this._appHeight);
        this._redPart.closePath();
        this._redPart.endFill();
        this._redPart.x = -this._appWidth / 2;
        this.addChild(this._redPart);

        this._bluePart.beginFill(0x0000ff);
        this._bluePart.moveTo(this._appWidth * 0.6, 0);
        this._bluePart.lineTo(this._appWidth + this._appWidth / 2, 0);
        this._bluePart.lineTo(this._appWidth + this._appWidth / 2, this._appHeight);
        this._bluePart.lineTo(this._appWidth * 0.4, this._appHeight);
        this._bluePart.closePath();
        this._bluePart.endFill();
        this._bluePart.x = this._appWidth / 2;
        this.addChild(this._bluePart);

        this._redPart.visible = false;
        this._bluePart.visible = false;
    }

    protected hideBackground(): void {
        this.stompCardsOntoArena();
        const timeline = gsap.timeline();

        timeline.to(this._redPart, {
            x: -this._redPart.width,
            duration: 1.5,
            ease: "power4.out"
        });

        timeline.to(
            this._bluePart,
            {
                x: this._bluePart.width,
                duration: 1.5,
                ease: "power4.out",
                onComplete: () => {
                    this._redPart.visible = false;
                    this._bluePart.visible = false;
                }
            },
            "<"
        );
    }

    protected stompCardsOntoArena(): void {
        const duration = 1.5;
        const leftSpriteProps = { scaleX: this._leftCardSprite!.scale.x, scaleY: this._leftCardSprite!.scale.y, y: this._leftCardSprite!.y, x: this._leftCardSprite!.x };
        const rightSpriteProps = { scaleX: this._rightCardSprite!.scale.x, scaleY: this._rightCardSprite!.scale.y, y: this._rightCardSprite!.y, x: this._rightCardSprite!.x };

        gsap.to(leftSpriteProps, {
            x: this._appWidth * 0.4,
            y: this._appHeight * 0.6,
            scaleX: -4,
            scaleY: 4,
            duration: duration,
            ease: "back.in",
            onUpdate: () => {
                this._leftCardSprite!.scale.set(leftSpriteProps.scaleX, leftSpriteProps.scaleY);
                this._leftCardSprite!.y = leftSpriteProps.y;
                this._leftCardSprite!.x = leftSpriteProps.x;
            }
        });

        gsap.to(rightSpriteProps, {
            x: this._appWidth * 0.6,
            y: this._appHeight * 0.6,
            scaleX: 4,
            scaleY: 4,
            duration: duration,
            ease: "back.in",
            onUpdate: () => {
                this._rightCardSprite!.scale.set(rightSpriteProps.scaleX, rightSpriteProps.scaleY);
                this._rightCardSprite!.y = rightSpriteProps.y;
                this._rightCardSprite!.x = rightSpriteProps.x;

            }
        });
    }
}
