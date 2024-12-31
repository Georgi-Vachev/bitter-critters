import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export default class HealthBar extends PIXI.Container {
    protected _enemyHalf: PIXI.Graphics;
    protected _playerHalf: PIXI.Graphics;
    protected readonly _appWidth: number = 2560;
    protected readonly _appHeight: number = 1440;

    constructor() {
        super();

        this._enemyHalf = this.createPolygon('left');
        this._playerHalf = this.createPolygon('right');

        this.addChild(this._enemyHalf, this._playerHalf);
    }

    public revealHealthBar(): void {
        gsap.to(this.position, {
            y: 0,
            duration: 1,
            ease: "bounce.out",
        });
    }

    protected createPolygon(direction: "left" | "right"): PIXI.Graphics {
        const polygon = new PIXI.Graphics();
        const fillColor = 0x6B8E23;
        const strokeColor = 0x000000;
        const strokeWidth = 2;

        polygon.lineStyle(strokeWidth, strokeColor, 1);
        polygon.beginFill(fillColor);

        if (direction === "left") {
            polygon.drawPolygon([
                0, this._appHeight,
                this._appWidth * 0.1, this._appHeight * 0.85,
                this._appWidth * 0.5, this._appHeight * 0.85,
                this._appWidth * 0.5, this._appHeight,
            ]);
        } else {
            polygon.drawPolygon([
                this._appWidth * 0.5, this._appHeight,
                this._appWidth * 0.5, this._appHeight * 0.85,
                this._appWidth * 0.9, this._appHeight * 0.85,
                this._appWidth, this._appHeight,
            ]);
        }

        polygon.position.set(0);
        polygon.endFill();

        return polygon;
    }
}
