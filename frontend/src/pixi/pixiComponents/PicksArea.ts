import * as PIXI from "pixi.js";

export default class PicksArea extends PIXI.Container {
    protected _background: PIXI.Graphics;
    protected _text: PIXI.Text;
    protected _leftCreature: PIXI.Sprite | null = null;
    protected _rightCreature: PIXI.Sprite | null = null;
    protected _leftButtons: PIXI.Container | null = null;
    protected _rightButtons: PIXI.Container | null = null;
    protected _leftRandomButton!: PIXI.Container;
    protected _rightRandomButton!: PIXI.Container;
    protected _addRandomCard: (side: "left" | "right") => void;
    protected readonly _appWidth: number;
    protected readonly _appHeight: number;

    constructor(appWidth: number, appHeight: number, addRandomCard: (side: "left" | "right") => void) {
        super();
        this._appWidth = appWidth;
        this._appHeight = appHeight;
        this._addRandomCard = addRandomCard;
        this.width = appWidth;
        this.height = 100;

        this._background = this.createBackground();
        this.addChild(this._background);

        this._text = this.createText();
        this._background.addChild(this._text);

        this.createPlaceholderButtons();
    }

    protected createBackground(): PIXI.Graphics {
        const backgroundWidth = this._appWidth * 0.4;
        const backgroundHeight = 220;
        const backgroundX = this._appWidth / 2 - backgroundWidth / 2;
        const backgroundY = this._appHeight - backgroundHeight;
        const cornerRadius = 45;

        const background = new PIXI.Graphics();
        background.beginFill(0x777777);
        background.moveTo(backgroundX + cornerRadius, backgroundY);
        background.lineTo(backgroundX + backgroundWidth - cornerRadius, backgroundY);
        background.quadraticCurveTo(
            backgroundX + backgroundWidth,
            backgroundY,
            backgroundX + backgroundWidth,
            backgroundY + cornerRadius
        );
        background.lineTo(backgroundX + backgroundWidth, backgroundY + backgroundHeight);
        background.lineTo(backgroundX, backgroundY + backgroundHeight);
        background.lineTo(backgroundX, backgroundY + cornerRadius);
        background.quadraticCurveTo(
            backgroundX,
            backgroundY,
            backgroundX + cornerRadius,
            backgroundY
        );
        background.endFill();

        return background;
    }

    protected createText(): PIXI.Text {
        const text = new PIXI.Text("Make your choice\nor\nroll the dice with '?'", {
            fontSize: 45,
            fill: "white",
            align: "center",
            fontFamily: "Comic Sans MS, Verdana, Futura",
        });
        text.anchor.set(0.5);
        text.position.set(this._appWidth / 2, this._appHeight - 220 / 2);

        return text;
    }

    protected createPlaceholderButtons(): void {
        this._leftRandomButton = this.createActionBox(0xebcd34, "?", 100);
        this._leftRandomButton.position.set(
            this._appWidth / 2 - this._background.width / 2 + this._leftRandomButton.width / 2,
            this._appHeight - this._background.height / 2 - this._leftRandomButton.height / 2
        );
        this._leftRandomButton.on("pointerdown", () => {
            this._addRandomCard("left")
        });

        this._rightRandomButton = this.createActionBox(0xebcd34, "?", 100);
        this._rightRandomButton.position.set(
            this._appWidth / 2 + this._background.width / 2 - this._rightRandomButton.width * 1.5,
            this._appHeight - this._background.height / 2 - this._rightRandomButton.height / 2
        );
        this._rightRandomButton.on("pointerdown", () => {
            this._addRandomCard("right")
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

        box.addChild(boxGraphics, boxText);
        box.interactive = true;
        box.cursor = "pointer";

        return box;
    }

    public addCard(creatureTexture: PIXI.Texture, position: "left" | "right"): void {
        const isLeft = position === "left";

        const oldCreature = isLeft ? this._leftCreature : this._rightCreature;
        const oldButtons = isLeft ? this._leftButtons : this._rightButtons;
        const randomButton = isLeft ? this._leftRandomButton : this._rightRandomButton;

        if (oldCreature) this._background.removeChild(oldCreature);
        if (oldButtons) this._background.removeChild(oldButtons);

        const creature = new PIXI.Sprite(creatureTexture);
        creature.width = 200;
        creature.height = 200;
        creature.position.set(
            isLeft
                ? this._appWidth / 2 - creature.width * 1.2
                : this._appWidth / 2 + creature.width * 1.2,
            this._appHeight - 200
        );

        if (isLeft) {
            creature.scale.x *= -1;
            this._leftCreature = creature;
            this._leftButtons = this.createCreatureButtons(position);
        } else {
            this._rightCreature = creature;
            this._rightButtons = this.createCreatureButtons(position);
        }

        this._background.removeChild(randomButton);
        this._background.addChild(creature, isLeft ? this._leftButtons! : this._rightButtons!);

        this.updateTextVisibility();
    }

    protected createCreatureButtons(position: "left" | "right"): PIXI.Container {
        const container = new PIXI.Container();

        const xButton = this.createActionBox(0xff0000, "X", 50);
        xButton.position.set(
            position === "left"
                ? this._appWidth / 2 - this._background.width / 2 + xButton.width / 2
                : this._appWidth / 2 + this._background.width / 2 - xButton.width * 1.5,
            this._appHeight - this._background.height / 2 - xButton.height
        );
        xButton.on("pointerdown", () => this.removeCreature(position));

        const questionButton = this.createActionBox(0xebcd34, "?", 50);
        questionButton.position.set(
            position === "left"
                ? this._appWidth / 2 - this._background.width / 2 + questionButton.width / 2
                : this._appWidth / 2 + this._background.width / 2 - questionButton.width * 1.5,
            this._appHeight - this._background.height / 2 + questionButton.height / 2
        );
        questionButton.on("pointerdown", () => {
            this._addRandomCard(position);
        });

        container.addChild(xButton, questionButton);
        return container;
    }

    protected removeCreature(position: "left" | "right"): void {
        const isLeft = position === "left";
        const creature = isLeft ? this._leftCreature : this._rightCreature;
        const buttons = isLeft ? this._leftButtons : this._rightButtons;
        const randomButton = isLeft ? this._leftRandomButton : this._rightRandomButton;

        if (creature) this._background.removeChild(creature);
        if (buttons) this._background.removeChild(buttons);

        this._background.addChild(randomButton);

        if (isLeft) this._leftCreature = null;
        else this._rightCreature = null;

        this.updateTextVisibility();
    }

    protected updateTextVisibility(): void {
        if (!this._leftCreature || !this._rightCreature) {
            if (!this._text.parent) this._background.addChild(this._text);
        } else {
            if (this._text.parent) this._text.parent.removeChild(this._text);
        }
    }
}
