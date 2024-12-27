import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PicksArea from "./PicksArea";
export default class Arena extends PIXI.Container {
    protected _app: PIXI.Application;
    protected _picksArea: PicksArea;
    private _redPart: PIXI.Graphics;
    private _bluePart: PIXI.Graphics;

    constructor(app: PIXI.Application, picksArea: PicksArea) {
        super();

        this._app = app;
        this._picksArea = picksArea;

        this._redPart = new PIXI.Graphics();
        this._bluePart = new PIXI.Graphics();

        this.createGraphics();
    }

    private createGraphics() {
        const { width, height } = this._app.renderer;

        this._redPart.beginFill(0xff0000);
        this._redPart.moveTo(-width / 2, 0);
        this._redPart.lineTo(width * 0.6, 0);
        this._redPart.lineTo(width * 0.4, height);
        this._redPart.lineTo(-width / 2, height);
        this._redPart.closePath();
        this._redPart.endFill();
        this._redPart.x = -width / 2;
        this.addChild(this._redPart);

        this._bluePart.beginFill(0x0000ff);
        this._bluePart.moveTo(width * 0.6, 0);
        this._bluePart.lineTo(width + width / 2, 0);
        this._bluePart.lineTo(width + width / 2, height);
        this._bluePart.lineTo(width * 0.4, height);
        this._bluePart.closePath();
        this._bluePart.endFill();
        this._bluePart.x = width / 2;
        this.addChild(this._bluePart);

        this._redPart.visible = false;
        this._bluePart.visible = false;
    }

    public animateIntro(): Promise<void> {
        this._redPart.visible = true;
        this._bluePart.visible = true;

        return new Promise((resolve) => {
            const timeline = gsap.timeline({
                onComplete: resolve
            });

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
                    ease: "bounce.out"
                },
                "<"
            );
        });
    }
}
