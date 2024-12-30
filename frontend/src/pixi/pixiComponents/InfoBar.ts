import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export default class InfoBar extends PIXI.Container {
    protected _theme: Theme;
    protected _rectangleBackground: PIXI.Sprite;
    protected _leftTriangleButton: PIXI.Graphics;
    protected _bottomTriangleButton: PIXI.Graphics;
    protected readonly _appWidth: number = 2560;
    protected readonly _appHeight: number = 1440;

    constructor(theme: Theme) {
        super();
        this._theme = theme;

        this._rectangleBackground = this.createRectangle();
        this.addChild(this._rectangleBackground);

        this._leftTriangleButton = this.createTriangle("left");
        this._leftTriangleButton.visible = false;
        this.addChildAt(this._leftTriangleButton, 0);

        this._bottomTriangleButton = this.createTriangle("right");
        this._bottomTriangleButton.visible = false;
        this.addChildAt(this._bottomTriangleButton, 0);
    }

    public revealRectangle(): void {
        gsap.to(this.position, {
            y: 0,
            duration: 1,
            ease: "bounce.out",
            onComplete: () => {
                this.revealTriangleButtons();
            },
        });
    }

    protected revealTriangleButtons(): void {
        this._leftTriangleButton.visible = true;
        this._bottomTriangleButton.visible = true;

        gsap.to(this._leftTriangleButton!.position, {
            x: 0,
            duration: 1,
            ease: "power1.out",
        });

        gsap.to(this._bottomTriangleButton!.position, {
            x: this._appWidth * 0.9,
            duration: 1,
            ease: "power1.out",
        });
    }

    protected createRectangle(): PIXI.Sprite {
        const rectangleWidth = this._appWidth * 0.8;
        const rectangleHeight = this._appHeight * 0.15;

        const toCssColor = (color: string): string => {
            if (color.startsWith("0x")) {
                return `#${color.slice(2)}`;
            }
            return color;
        };

        const leftColor = toCssColor(this._theme.rightMainColor);
        const rightColor = toCssColor(this._theme.leftMainColor);

        const canvas = document.createElement('canvas');
        canvas.width = rectangleWidth;
        canvas.height = rectangleHeight;

        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createLinearGradient(0, 0, rectangleWidth, 0);

        gradient.addColorStop(0, leftColor);
        gradient.addColorStop(1, rightColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rectangleWidth, rectangleHeight);

        const texture = PIXI.Texture.from(canvas);

        const rectangle = new PIXI.Sprite(texture);
        rectangle.position.set(this._appWidth * 0.1, 0);

        return rectangle;
    }

    protected createTriangle(direction: "left" | "right"): PIXI.Graphics {
        const triangle = new PIXI.Graphics();
        const triangleWidth = this._appWidth * 0.1;
        const triangleHeight = this._appHeight * 0.15;
        const color = direction === "right" ? this._theme.leftButtonColor : this._theme.rightButtonColor;
        const hoverColor = 0x000000;

        triangle.beginFill(color);
        if (direction === "left") {
            triangle.drawPolygon([
                0, 0,
                triangleWidth, 0,
                triangleWidth, triangleHeight,
            ]);

            triangle.position.set(this._appWidth * 0.1, 0);
        } else {
            triangle.drawPolygon([
                0, 0,
                triangleWidth, 0,
                0, triangleHeight,
            ]);

            triangle.position.set(this._appWidth * 0.8, 0);
        }
        triangle.endFill();

        triangle.interactive = true;
        triangle.cursor = "pointer";

        triangle.on("pointerdown", () => {
            if (direction === "left") {
                console.log(`Left button clicked on Info Bar`);
            } else {
                console.log(`Right button clicked on Info Bar`);
            }
        });

        triangle.on("pointerover", () => {
            triangle.tint = hoverColor;
        });

        triangle.on("pointerout", () => {
            triangle.tint = 0xFFFFFF;
        });

        return triangle;
    }
}
