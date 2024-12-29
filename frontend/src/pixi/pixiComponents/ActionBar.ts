import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export default class ActionBar extends PIXI.Container {
    protected _side: "left" | "right";
    protected _abilitySlots: PIXI.Container[] = [];
    protected _consumableSlots: PIXI.Container[] = [];
    protected _isInteractive: boolean;
    protected readonly _appWidth: number;
    protected readonly _appHeight: number;

    private _rectangleBackground: PIXI.Graphics;
    private _topTriangleButton: PIXI.Graphics;
    private _bottomTriangleButton: PIXI.Graphics;

    constructor(appWidth: number, appHeight: number, side: "left" | "right") {
        super();
        this._side = side;
        this._isInteractive = side === "right";

        this._appWidth = appWidth;
        this._appHeight = appHeight;

        // Set up layout and buttons
        this._rectangleBackground = this.createRectangle();
        this.addChild(this._rectangleBackground);

        this._topTriangleButton = this.createTriangle("up");
        this._topTriangleButton.visible = false; // Hidden initially
        this.addChildAt(this._topTriangleButton, 0);

        this._bottomTriangleButton = this.createTriangle("down");
        this._bottomTriangleButton.visible = false; // Hidden initially
        this.addChildAt(this._bottomTriangleButton, 0);

        this.setupLayout();
    }

    protected createRectangle(): PIXI.Graphics {
        const bgColor = this._side === "left" ? 0xA89984 : 0x7C90A0;

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

        triangle.beginFill(this._side === "left" ? 0x8A7664 : 0x5F7280);
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
            triangle.position.set(0, this._appHeight * 0.15); // Above the rectangle
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
            triangle.position.set(0, this._appHeight * 0.7); // Below the rectangle
        }
        triangle.endFill();

        triangle.interactive = true;
        triangle.cursor = "pointer";

        triangle.on("pointerdown", () => {
            if (direction === "up") {
                console.log(`${this._side} Action Bar: Switch to Abilities`);
                // Implement switch to abilities logic
            } else {
                console.log(`${this._side} Action Bar: Switch to Consumables`);
                // Implement switch to consumables logic
            }
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
        }, 2000); // Cooldown duration
    }

    public useConsumable(index: number, count: number): void {
        const slot = this._consumableSlots[index];
        if (!slot) return;

        console.log(`Consumable used at slot ${index}. Remaining count: ${count}`);
    }

    public revealTriangleButtons(): void {
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

    public getTriangles(): { top: PIXI.Graphics; bottom: PIXI.Graphics } {
        return {
            top: this._topTriangleButton,
            bottom: this._bottomTriangleButton,
        };
    }
}
