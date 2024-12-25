import * as PIXI from "pixi.js";

export default class PickArea extends PIXI.Container {
    protected _background: PIXI.Graphics;
    protected _text: PIXI.Text;
    protected _leftCreature: PIXI.Sprite | null = null;
    protected _rightCreature: PIXI.Sprite | null = null;
    protected _leftButtons: PIXI.Container | null = null;
    protected _rightButtons: PIXI.Container | null = null;
    protected _leftRandomButton!: PIXI.Container
    protected _rightRandomButton!: PIXI.Container;
    protected _appWidth: number;
    protected _appHeight: number;

    constructor(appWidth: number, appHeight: number) {
        super();
        this._appWidth = appWidth;
        this._appHeight = appHeight;
        this.width = appWidth;
        this.height = 100;

        const backgroundWidth = appWidth * 0.4;
        const backgroundHeight = 220;
        const backgroundX = appWidth / 2 - backgroundWidth / 2;
        const backgroundY = appHeight - backgroundHeight;
        const cornerRadius = 45;

        this._background = new PIXI.Graphics();
        this._background.beginFill(0x777777);
        this._background.moveTo(backgroundX + cornerRadius, backgroundY);
        this._background.lineTo(backgroundX + backgroundWidth - cornerRadius, backgroundY);
        this._background.quadraticCurveTo(
            backgroundX + backgroundWidth,
            backgroundY,
            backgroundX + backgroundWidth,
            backgroundY + cornerRadius
        );
        this._background.lineTo(backgroundX + backgroundWidth, backgroundY + backgroundHeight);
        this._background.lineTo(backgroundX, backgroundY + backgroundHeight);
        this._background.lineTo(backgroundX, backgroundY + cornerRadius);
        this._background.quadraticCurveTo(
            backgroundX,
            backgroundY,
            backgroundX + cornerRadius,
            backgroundY
        );
        this._background.endFill();

        this.addChild(this._background);

        this._text = new PIXI.Text("Make your choice\nor\nroll the dice with '?'", {
            fontSize: 45,
            fill: "white",
            align: "center",
            fontFamily: "Comic Sans MS, Verdana, Futura"
        });
        this._text.anchor.set(0.5);
        this._text.position.set(appWidth / 2, appHeight - backgroundHeight / 2);
        this._background.addChild(this._text);

        this.createPlaceholderButtons();
    }

    protected createPlaceholderButtons(): void {
        this._leftRandomButton = this.createActionBox(0xebcd34, "?", 100);
        this._leftRandomButton.position.set((this._appWidth / 2 - this._background.width / 2) + this._leftRandomButton.width / 2,
            this._appHeight - this._background.height / 2 - this._leftRandomButton.height / 2);
        this._leftRandomButton.on("pointerdown", () => {
            console.log("Choose a random left creature!");
        });

        this._rightRandomButton = this.createActionBox(0xebcd34, "?", 100);
        this._rightRandomButton.position.set((this._appWidth / 2 + this._background.width / 2) - this._rightRandomButton.width * 1.5,
            this._appHeight - this._background.height / 2 - this._rightRandomButton.height / 2);
        this._rightRandomButton.on("pointerdown", () => {
            console.log("Choose a random right creature!");
        });

        this._background.addChild(this._leftRandomButton, this._rightRandomButton);
    }

    protected createActionBox(color: number, label: string, size: number): PIXI.Container {
        const box = new PIXI.Container();
        const boxGraphics = new PIXI.Graphics();
        boxGraphics.beginFill(color);
        boxGraphics.drawRect(0, 0, size, size);
        boxGraphics.endFill();

        const boxText = new PIXI.Text(label, {
            fontSize: 50,
            fontWeight: "bold",
            fill: "black",
            align: "center",
        });

        boxText.anchor.set(0.5);
        boxText.position.set(size / 2);

        box.addChild(boxGraphics);
        box.addChild(boxText);

        box.interactive = true;
        box.cursor = "pointer";

        return box;
    }

    public addCreature(creatureTexture: PIXI.Texture, position: "left" | "right"): void {
        if (position === "left" && this._leftCreature) {
            this._background.removeChild(this._leftCreature);
            if (this._leftButtons) this.removeChild(this._leftButtons);
        } else if (position === "right" && this._rightCreature) {
            this._background.removeChild(this._rightCreature);
            if (this._rightButtons) this.removeChild(this._rightButtons);
        }

        const sprite = new PIXI.Sprite(creatureTexture);
        sprite.width = 200;
        sprite.height = 200;
        sprite.position.x =
            position === "left"
                ? this._appWidth / 2 - sprite.width * 1.2
                : this._appWidth / 2 + sprite.width * 1.2;
        sprite.position.y = this._appHeight - 200;

        this._background.addChild(sprite);

        if (position === "left") {
            this._leftCreature = sprite;
            sprite.scale.x *= -1;
            this._leftButtons = this.createCreatureButtons(position);
            this._background.removeChild(this._leftRandomButton);
            this.addChild(this._leftButtons);
        } else {
            this._rightCreature = sprite;
            this._rightButtons = this.createCreatureButtons(position);
            this._background.removeChild(this._rightRandomButton);
            this.addChild(this._rightButtons);
        }

        if (this._leftCreature && this._rightCreature) {
            this._text.parent?.removeChild(this._text);
        }
    }

    protected createCreatureButtons(position: "left" | "right"): PIXI.Container {
        const container = new PIXI.Container();

        const xButton = this.createActionBox(0xff0000, "X", 50);

        const buttonPosX = position === "left"
            ? (this._appWidth / 2 - this._background.width / 2) + xButton.width / 2
            : (this._appWidth / 2 + this._background.width / 2) - xButton.width * 1.5;

        xButton.position.set(buttonPosX, (this._appHeight - this._background.height / 2) - xButton.height);
        xButton.on("pointerdown", () => {
            if (position === "left") this._leftCreature = null;
            else this._rightCreature = null;
            this.updateCreatureDisplay();
        });

        const questionButton = this.createActionBox(0xffff00, "?", 50);
        questionButton.position.set(buttonPosX, (this._appHeight - this._background.height / 2) + questionButton.height / 2);
        questionButton.on("pointerdown", () => {
            console.log(`Choose a random ${position} creature!`);
        });

        container.addChild(xButton);
        container.addChild(questionButton);
        return container;
    }

    protected updateCreatureDisplay(): void {
        if (!this._leftCreature && !this._rightCreature) {
            if (!this._text.parent) this._background.addChild(this._text);
        }

        if (this._leftCreature) this._background.addChild(this._leftCreature);
        if (this._rightCreature) this._background.addChild(this._rightCreature);
    }
}