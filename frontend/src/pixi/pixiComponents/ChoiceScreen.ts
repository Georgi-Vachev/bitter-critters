import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export default class ChoiceScreen {
    static readonly BUTTON_HEIGHT = 100;

    protected _app: PIXI.Application;
    protected _overlay: PIXI.Graphics | null = null;
    protected _cardContainer: PIXI.Container | null = null;
    protected _pickButton: PIXI.Container | null = null;
    protected _fightButton: PIXI.Container | null = null;
    protected _originalParent: PIXI.Container | null = null;
    protected _originalPosition: { x: number; y: number } | null = null;
    protected _cardName: string = "";
    protected _onPick: ((name: string) => void) | null = null;
    protected _onFight: ((name: string) => void) | null = null;

    constructor(app: PIXI.Application) {
        this._app = app;
    }

    public show(card: PIXI.Container, _cardName: string, onPick: (name: string) => void, onFight: (name: string) => void): void {
        this._onPick = onPick;
        this._onFight = onFight;

        this._originalParent = card.parent;
        this._originalPosition = { x: card.x, y: card.y };
        this._originalParent?.removeChild(card);
        this._cardName = _cardName;

        if (this._overlay) {
            this._overlay.visible = true
        } else {
            this._overlay = new PIXI.Graphics();
            this._overlay.rect(0, 0, this._app.renderer.width, this._app.renderer.height);
            this._overlay.fill(0x000000, 0.5);
            this._overlay.interactive = true;
            this._app.stage.addChild(this._overlay);

            this._overlay.on("pointerdown", () => {
                card.interactive = true;
                this.hide();
            });
        }

        card.pivot.set(card.width / 2, card.height / 2);

        this._cardContainer = new PIXI.Container();
        this._overlay.addChild(this._cardContainer);

        this._cardContainer.addChild(card);

        const cardProps = { x: card.x, y: card.y, scaleX: card.scale.x, scaleY: card.scale.y };

        gsap.to(cardProps, {
            x: this._app.renderer.width / 2,
            y: this._app.renderer.height / 2 - ChoiceScreen.BUTTON_HEIGHT / 2,
            scaleX: 2,
            scaleY: 2,
            duration: 0.25,
            onUpdate: () => {
                card.position.set(cardProps.x, cardProps.y);
                card.scale.set(cardProps.scaleX, cardProps.scaleY);
            },
            onComplete: () => {
                if (this._pickButton && this._fightButton) {
                    this._pickButton.visible = true;
                    this._fightButton.visible = true;
                } else {
                    this.createButtons();
                }
            }
        });
    }

    public hide(): void {
        if (this._cardContainer && this._cardContainer.children.length > 0 && this._originalParent) {
            const card = this._cardContainer.children[0];
            card.position.set(this._originalPosition!.x, this._originalPosition!.y);
            card.scale.set(1);
            card.interactive = true;
            this._originalParent.addChild(card);
            this._cardContainer.removeChild(card);
        }

        this._overlay!.visible = false;
        this._pickButton!.visible = false
        this._fightButton!.visible = false
        this._app!.stage.interactive = true;
    }

    protected createButtons(): void {
        const buttonStyle = new PIXI.TextStyle({
            fontSize: 50,
            fill: "#ffffff",
            align: "center",
            fontWeight: "bold",
        });

        const buttonWidth = this._cardContainer!.children[0].width / 2;
        const buttonHeight = ChoiceScreen.BUTTON_HEIGHT;

        this._pickButton = new PIXI.Container();
        const pickButtonBackground = new PIXI.Graphics();

        pickButtonBackground.roundRect(0, 0, buttonWidth, buttonHeight, 10);
        pickButtonBackground.fill(0x54bf66);
        this._pickButton.addChild(pickButtonBackground);

        const pickButtonText = new PIXI.Text({ text: "PICK IT", style: buttonStyle });

        pickButtonText.anchor.set(0.5);
        pickButtonText.position.set(buttonWidth / 2, buttonHeight / 2);
        this._pickButton.addChild(pickButtonText);

        this._pickButton.interactive = true;
        this._pickButton.cursor = "pointer";
        this._pickButton.position.set(this._app.renderer.width / 2 - buttonWidth, this._app.renderer.height - 180);

        this._pickButton.on("pointerover", () => {
            console.error('pointerover')
            pickButtonBackground.tint = 0x00ff00;
        });
        this._pickButton.on("pointerout", () => {
            pickButtonBackground.tint = 0xffffff;
        });

        this._pickButton.on("pointerdown", () => {
            this._onPick?.(this._cardName);
            this.hide();
        });

        this._app.stage.addChild(this._pickButton);

        this._fightButton = new PIXI.Container();
        const fightButtonBackground = new PIXI.Graphics();

        fightButtonBackground.roundRect(0, 0, buttonWidth, buttonHeight, 10);
        fightButtonBackground.fill(0xe76f51);
        this._fightButton.addChild(fightButtonBackground);

        const fightButtonText = new PIXI.Text({ text: "FIGHT IT", style: buttonStyle });
        fightButtonText.anchor.set(0.5);
        fightButtonText.position.set(buttonWidth / 2, buttonHeight / 2);
        this._fightButton.addChild(fightButtonText);

        this._fightButton.interactive = true;
        this._fightButton.cursor = "pointer";
        this._fightButton.position.set(this._app.renderer.width / 2, this._app.renderer.height - 180);

        this._fightButton.on("pointerover", () => {
            fightButtonBackground.tint = 0xff0000;
        });
        this._fightButton.on("pointerout", () => {
            fightButtonBackground.tint = 0xffffff;
        });

        this._fightButton.on("pointerdown", () => {
            this._onFight?.(this._cardName);
            this.hide();
        });

        this._app.stage.addChild(this._fightButton);
    }
}
