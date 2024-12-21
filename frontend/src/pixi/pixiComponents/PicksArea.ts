import * as PIXI from "pixi.js";

export default class PickArea {
    protected _container: PIXI.Container;
    protected _background: PIXI.Graphics;
    protected _text: PIXI.Text;
    protected _leftCreature: PIXI.Sprite | null = null;
    protected _rightCreature: PIXI.Sprite | null = null;
    protected _appWidth: number;
    protected _appHeight: number;

    constructor(stage: PIXI.Container, appWidth: number, appHeight: number) {
        this._container = new PIXI.Container();
        this._appWidth = appWidth;
        this._appHeight = appHeight;
        this._container.width = appWidth;
        this._container.height = 100;
        stage.addChild(this._container);

        const backgroundWidth = appWidth * 0.3
        const backgroundHeight = 200
        const backgroundX = appWidth / 2 - backgroundWidth / 2
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

        this._container.addChild(this._background);

        this._text = new PIXI.Text("Take your pick", {
            fontSize: 70,
            fill: "white",
            align: "center",
        });
        this._text.anchor.set(0.5);
        this._text.position.set((appWidth / 2), appHeight - backgroundHeight / 2);
        this._background.addChild(this._text);
    }

    public addCreature(creatureTexture: PIXI.Texture, position: "left" | "right"): void {
        if (this._text.parent) {
            this._text.parent.removeChild(this._text);
        }

        if (position === "left" && this._leftCreature) {
            this._background.removeChild(this._leftCreature);
        } else if (position === "right" && this._rightCreature) {
            this._background.removeChild(this._rightCreature);
        }

        const sprite = new PIXI.Sprite(creatureTexture);

        sprite.width = 200
        sprite.height = 200
        sprite.position.x = position === "left" ? this._appWidth / 2 - sprite.width / 1.5 : this._appWidth / 2 + sprite.width / 1.5
        sprite.position.y = this._appHeight - 200

        this._background.addChild(sprite);

        if (position === "left") {
            this._leftCreature = sprite;
            sprite.scale.x *= -1;
        } else {
            this._rightCreature = sprite;
        }
    }
}
