import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export default class ActionBar extends PIXI.Container {
    protected _side: "left" | "right";
    protected _abilitySlots: PIXI.Container[] = [];
    protected _consumableSlots: PIXI.Container[] = [];
    protected _isInteractive: boolean;
    protected _theme: Theme;
    protected _rectangleBackground: PIXI.Graphics;
    protected _topTriangleButton: PIXI.Graphics;
    protected _bottomTriangleButton: PIXI.Graphics;
    protected readonly _appWidth: number = 2560;
    protected readonly _appHeight: number = 1440;

    constructor(side: "left" | "right", theme: Theme) {
        super();
        this._side = side;
        this._isInteractive = side === "right";

        this._theme = theme;

        this._rectangleBackground = this.createRectangle();
        this.addChild(this._rectangleBackground);

        this._topTriangleButton = this.createTriangle("up");
        this._topTriangleButton.visible = false;
        this.addChildAt(this._topTriangleButton, 0);

        this._bottomTriangleButton = this.createTriangle("down");
        this._bottomTriangleButton.visible = false;
        this.addChildAt(this._bottomTriangleButton, 0);

        this.setupLayout();
    }

    public revealRectangle(): void {
        gsap.to(this.position, {
            x: this._side === 'left' ? 0 : this.x - this.width,
            duration: 1,
            ease: "bounce.out",
            onComplete: () => {
                this.revealTriangleButtons();
            },
        });
    }

    public useAbility(index: number): void {
        const slot = this._abilitySlots[index];
        if (!slot) return;

        const cooldownOverlay = new PIXI.Graphics();
        cooldownOverlay.beginFill(0x000000, 0.5);
        cooldownOverlay.drawRect(0, 0, slot.width, slot.height);
        cooldownOverlay.endFill();
        slot.addChild(cooldownOverlay);

        setTimeout(() => {
            slot.removeChild(cooldownOverlay);
        }, 2000);
    }

    public useConsumable(index: number, count: number): void {
        const slot = this._consumableSlots[index];
        if (!slot) return;

        console.log(`Consumable used at slot ${index}. Remaining count: ${count}`);
    }

    protected revealTriangleButtons(): void {
        this._topTriangleButton.visible = true;
        this._bottomTriangleButton.visible = true;

        gsap.to(this._topTriangleButton!.position, {
            y: 0,
            duration: 1,
            ease: "power1.out",
        });

        gsap.to(this._bottomTriangleButton!.position, {
            y: this._appHeight * 0.85,
            duration: 1,
            ease: "power1.out",
        });
    }

    protected createRectangle(): PIXI.Graphics {
        const bgColor = this._side === "left" ? this._theme.leftMainColor : this._theme.rightMainColor;

        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(bgColor);
        rectangle.drawRect(0, 0, this._appWidth * 0.1, this._appHeight * 0.7);
        rectangle.endFill();

        rectangle.position.set(0, this._appHeight * 0.15);

        return rectangle;
    }

    protected createTriangle(direction: "up" | "down"): PIXI.Graphics {
        const triangle = new PIXI.Graphics();
        const triangleWidth = this._appWidth * 0.1;
        const triangleHeight = this._appHeight * 0.15;
        const color = this._side === "left" ? this._theme.leftButtonColor : this._theme.rightButtonColor;
        const hoverColor = 0x000000;

        triangle.beginFill(color);
        if (direction === "up") {
            if (this._side === "left") {
                triangle.drawPolygon([
                    0, 0,
                    triangleWidth, triangleHeight,
                    0, triangleHeight,
                ]);
            } else {
                triangle.drawPolygon([
                    triangleWidth, 0,
                    triangleWidth, triangleHeight,
                    0, triangleHeight,
                ]);
            }
            triangle.position.set(0, this._appHeight * 0.15);
        } else {
            if (this._side === "left") {
                triangle.drawPolygon([
                    0, 0,
                    triangleWidth, 0,
                    0, triangleHeight,
                ]);
            } else {
                triangle.drawPolygon([
                    0, 0,
                    triangleWidth, 0,
                    triangleWidth, triangleHeight,
                ]);
            }
            triangle.position.set(0, this._appHeight * 0.7);
        }
        triangle.endFill();

        triangle.interactive = true;
        triangle.cursor = "pointer";

        triangle.on("pointerdown", () => {
            if (direction === "up") {
                console.log(`${this._side} Action Bar: Switch to Abilities`);
            } else {
                console.log(`${this._side} Action Bar: Switch to Consumables`);
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

    protected setupLayout(): void {
        const totalSlots = 4;
        const slotHeight = (this._appHeight * 0.7) / totalSlots;

        for (let i = 0; i < totalSlots; i++) {
            const slot = new PIXI.Container();
            const slotBackground = new PIXI.Graphics();
            slotBackground.beginFill(0xcccccc);
            slotBackground.roundRect(0, 0, this._appWidth * 0.08, slotHeight * 0.8, 20);
            slotBackground.endFill();

            slot.addChild(slotBackground);
            slot.position.set(this._appWidth * 0.01, (this._appHeight * 0.15) + i * slotHeight + slotHeight * 0.1);
            this.addChild(slot);

            if (i < totalSlots / 2) {
                this._abilitySlots.push(slot);
            } else {
                this._consumableSlots.push(slot);
            }

            if (this._isInteractive) {
                slot.interactive = true;
                slot.on("pointerdown", () => this.onSlotClick(i));
            }
        }
    }

    protected onSlotClick(index: number): void {
        console.log(`Slot ${index} clicked on ${this._side} bar`);
    }
}
