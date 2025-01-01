import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export default class HealthBar extends PIXI.Container {
    protected _enemyHalf: PIXI.Graphics;
    protected _playerHalf: PIXI.Graphics;

    protected _enemyMask: PIXI.Graphics;
    protected _playerMask: PIXI.Graphics;

    protected _enemyStroke: PIXI.Graphics;
    protected _playerStroke: PIXI.Graphics;

    protected readonly _appWidth: number = 2560;
    protected readonly _appHeight: number = 1440;

    constructor() {
        super();

        // Create the health bar polygons
        this._enemyHalf = this.createPolygon("left");
        this._playerHalf = this.createPolygon("right");

        // Create masks for the health bars
        this._enemyMask = this.createMask("left");
        this._playerMask = this.createMask("right");

        // Apply masks
        this._enemyHalf.mask = this._enemyMask;
        this._playerHalf.mask = this._playerMask;

        // Create the strokes
        this._enemyStroke = this.createStroke("left");
        this._playerStroke = this.createStroke("right");

        // Add to the display list
        this.addChild(
            this._enemyHalf,
            this._playerHalf,
            this._enemyMask,
            this._playerMask,
            this._enemyStroke,
            this._playerStroke
        );
    }

    public revealHealthBar(): void {
        gsap.to(this.position, {
            y: 0,
            duration: 1,
            ease: "bounce.out",
        });
    }

    public enemyTakeHit(damageNumber: number): void {
        const maskWidth = this._enemyMask.width - damageNumber;

        gsap.to(this._enemyMask, {
            width: Math.max(0, maskWidth), // Prevent negative width
            duration: 0.5,
            ease: "power2.out",
        });
    }

    public playerTakeHit(damageNumber: number): void {
        gsap.to(this._playerMask, {
            x: this._playerMask.x + damageNumber, // Move the mask right to left
            duration: 0.5,
            ease: "power2.out",
        });
    }

    protected createPolygon(direction: "left" | "right"): PIXI.Graphics {
        const polygon = new PIXI.Graphics();
        const fillColor = 0x6b8e23;

        polygon.beginFill(fillColor);

        if (direction === "left") {
            polygon.drawPolygon([
                0,
                this._appHeight,
                this._appWidth * 0.1,
                this._appHeight * 0.85,
                this._appWidth * 0.5,
                this._appHeight * 0.85,
                this._appWidth * 0.5,
                this._appHeight,
            ]);
        } else {
            polygon.drawPolygon([
                this._appWidth * 0.5,
                this._appHeight,
                this._appWidth * 0.5,
                this._appHeight * 0.85,
                this._appWidth * 0.9,
                this._appHeight * 0.85,
                this._appWidth,
                this._appHeight,
            ]);
        }

        polygon.endFill();
        return polygon;
    }

    protected createMask(direction: "left" | "right"): PIXI.Graphics {
        const mask = new PIXI.Graphics();

        mask.beginFill(0xffffff); // Mask color doesn't matter
        if (direction === "left") {
            // Initial mask size for enemy
            mask.drawRect(0, this._appHeight * 0.85, this._appWidth * 0.5, this._appHeight * 0.15);
        } else {
            // Initial mask size for player
            mask.drawRect(this._appWidth * 0.5, this._appHeight * 0.85, this._appWidth * 0.5, this._appHeight * 0.15);
        }

        mask.endFill();
        return mask;
    }

    protected createStroke(direction: "left" | "right"): PIXI.Graphics {
        const stroke = new PIXI.Graphics();
        const strokeColor = 0xffffff;
        const strokeWidth = 4;

        if (direction === "left") {
            stroke.moveTo(strokeWidth, this._appHeight); // Start at bottom-left
            stroke.lineTo(this._appWidth * 0.1 + strokeWidth, this._appHeight * 0.85); // Top-left corner
            stroke.lineTo(this._appWidth * 0.5, this._appHeight * 0.85); // Top-right corner
            stroke.lineTo(this._appWidth * 0.5, this._appHeight); // Bottom-right corner
            stroke.closePath(); // Explicitly close the path
        } else {
            stroke.moveTo(this._appWidth * 0.5, this._appHeight); // Start at bottom-left
            stroke.lineTo(this._appWidth * 0.5, this._appHeight * 0.85); // Top-left corner
            stroke.lineTo(this._appWidth * 0.9 - strokeWidth, this._appHeight * 0.85); // Top-right corner
            stroke.lineTo(this._appWidth - strokeWidth, this._appHeight); // Bottom-right corner
            stroke.closePath(); // Explicitly close the path
        }

        stroke.stroke({ width: strokeWidth, color: strokeColor });
        return stroke;
    }
}
