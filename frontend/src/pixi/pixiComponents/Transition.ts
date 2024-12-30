import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import BattleField from "./BattleField";

export default class Transition extends PIXI.Container {
    protected _app: PIXI.Application;
    protected _leftCurtain: PIXI.Graphics;
    protected _rightCurtain: PIXI.Graphics;
    protected _leftCardSprite: PIXI.Sprite | null = null;
    protected _rightCardSprite: PIXI.Sprite | null = null;
    protected _theme: Theme;
    protected _battleField: BattleField;
    protected readonly _appWidth: number = 2560;
    protected readonly _appHeight: number = 1440;

    constructor(app: PIXI.Application, battleField: BattleField, theme: Theme) {
        super();

        this._app = app;
        this._battleField = battleField;
        this._theme = theme;

        this._leftCurtain = new PIXI.Graphics();
        this._rightCurtain = new PIXI.Graphics();

        this.createIntroBackground();
    }

    public animateIntro(leftCardSprite: PIXI.Sprite, rightCardSprite: PIXI.Sprite): void {
        this._leftCardSprite = leftCardSprite;
        this._rightCardSprite = rightCardSprite;

        this._leftCurtain.visible = true;
        this._rightCurtain.visible = true;

        const timeline = gsap.timeline();

        timeline.to(this._leftCurtain, {
            x: 0,
            duration: 1,
            ease: "bounce.out"
        });

        timeline.to(
            this._rightCurtain,
            {
                x: 0,
                duration: 1,
                ease: "bounce.out",
                onComplete: () => {
                    this._battleField.reveal()
                    gsap.delayedCall(1, () => this.hideBackground());
                }
            },
            "<"
        );
    }

    protected createIntroBackground() {
        this._leftCurtain.beginFill(this._theme.leftMainColor);
        this._leftCurtain.moveTo(-this._appWidth / 2, 0);
        this._leftCurtain.lineTo(this._appWidth * 0.6, 0);
        this._leftCurtain.lineTo(this._appWidth * 0.4, this._appHeight);
        this._leftCurtain.lineTo(-this._appWidth / 2, this._appHeight);
        this._leftCurtain.closePath();
        this._leftCurtain.endFill();
        this._leftCurtain.x = -this._appWidth / 2;
        this.addChild(this._leftCurtain);

        this._rightCurtain.beginFill(this._theme.rightMainColor);
        this._rightCurtain.moveTo(this._appWidth * 0.6, 0);
        this._rightCurtain.lineTo(this._appWidth + this._appWidth / 2, 0);
        this._rightCurtain.lineTo(this._appWidth + this._appWidth / 2, this._appHeight);
        this._rightCurtain.lineTo(this._appWidth * 0.4, this._appHeight);
        this._rightCurtain.closePath();
        this._rightCurtain.endFill();
        this._rightCurtain.x = this._appWidth / 2;
        this.addChild(this._rightCurtain);

        this._leftCurtain.visible = false;
        this._rightCurtain.visible = false;
    }

    protected hideBackground(): void {
        this.stompCardsOntoArena();
        const timeline = gsap.timeline();

        timeline.to(this._leftCurtain, {
            x: -this._leftCurtain.width,
            duration: 1.5,
            ease: "power4.out"
        });

        timeline.to(
            this._rightCurtain,
            {
                x: this._rightCurtain.width,
                duration: 1.5,
                ease: "power4.out",
                onComplete: () => {
                    this._leftCurtain.visible = false;
                    this._rightCurtain.visible = false;
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
            scaleX: -6,
            scaleY: 6,
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
            scaleX: 6,
            scaleY: 6,
            duration: duration,
            ease: "back.in",
            onUpdate: () => {
                this._rightCardSprite!.scale.set(rightSpriteProps.scaleX, rightSpriteProps.scaleY);
                this._rightCardSprite!.y = rightSpriteProps.y;
                this._rightCardSprite!.x = rightSpriteProps.x;
            },
            onComplete: () => {
                this._battleField.startBattle(this._leftCardSprite!, this._rightCardSprite!);
            }
        });
    }
}
