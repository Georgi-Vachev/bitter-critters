import * as PIXI from "pixi.js";

export default class ChoiceScreen {
    static readonly BUTTON_HEIGHT = 100;

    protected app: PIXI.Application;
    protected overlay: PIXI.Graphics | null = null;
    protected cardContainer: PIXI.Container | null = null;
    protected pickButton: PIXI.Container | null = null;
    protected fightButton: PIXI.Container | null = null;
    protected originalParent: PIXI.Container | null = null;
    protected originalPosition: { x: number; y: number } | null = null;
    protected onPick: ((name: string) => void) | null = null;
    protected onFight: ((name: string) => void) | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public show(card: PIXI.Container, cardName: string, onPick: (name: string) => void, onFight: (name: string) => void): void {
        this.onPick = onPick;
        this.onFight = onFight;

        this.originalParent = card.parent;
        this.originalPosition = { x: card.x, y: card.y };

        this.originalParent?.removeChild(card);

        this.overlay = new PIXI.Graphics();
        this.overlay.rect(0, 0, this.app.renderer.width, this.app.renderer.height);
        this.overlay.fill(0x000000, 0.5);
        this.overlay.interactive = true;
        this.app.stage.addChild(this.overlay);

        this.overlay.on("pointerdown", () => {
            card.interactive = true;
            this.hide();
        });

        this.cardContainer = new PIXI.Container();
        card.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2 - ChoiceScreen.BUTTON_HEIGHT / 2);
        card.pivot.set(card.width / 2, card.height / 2);
        card.scale.set(2);
        this.cardContainer.addChild(card);
        this.overlay.addChild(this.cardContainer);

        this.createButtons(cardName);
    }

    public hide(): void {
        if (this.cardContainer && this.cardContainer.children.length > 0 && this.originalParent) {
            const card = this.cardContainer.children[0];
            card.position.set(this.originalPosition!.x, this.originalPosition!.y);
            card.scale.set(1);
            card.interactive = true;
            this.originalParent.addChild(card);
        }

        this.overlay!.visible = false;
        this.pickButton!.visible = false
        this.fightButton!.visible = false
        this.app!.stage.interactive = true;
    }

    protected createButtons(cardName: string): void {
        const buttonStyle = new PIXI.TextStyle({
            fontSize: 50,
            fill: "#ffffff",
            align: "center",
            fontWeight: "bold",
        });

        const buttonWidth = this.cardContainer!.children[0].width / 2;
        const buttonHeight = ChoiceScreen.BUTTON_HEIGHT;

        this.pickButton = new PIXI.Container();
        const pickButtonBackground = new PIXI.Graphics();

        pickButtonBackground.roundRect(0, 0, buttonWidth, buttonHeight, 10);
        pickButtonBackground.fill(0x54bf66);
        this.pickButton.addChild(pickButtonBackground);

        const pickButtonText = new PIXI.Text({ text: "PICK IT", style: buttonStyle });

        pickButtonText.anchor.set(0.5);
        pickButtonText.position.set(buttonWidth / 2, buttonHeight / 2);
        this.pickButton.addChild(pickButtonText);

        this.pickButton.interactive = true;
        this.pickButton.cursor = "pointer";
        this.pickButton.position.set(this.app.renderer.width / 2 - buttonWidth, this.app.renderer.height - 180);

        this.pickButton.on("pointerover", () => {
            console.error('pointerover')
            pickButtonBackground.tint = 0x00ff00;
        });
        this.pickButton.on("pointerout", () => {
            pickButtonBackground.tint = 0xffffff;
        });

        this.pickButton.on("pointerdown", () => {
            this.onPick?.(cardName);
            this.hide();
        });

        this.app.stage.addChild(this.pickButton);

        this.fightButton = new PIXI.Container();
        const fightButtonBackground = new PIXI.Graphics();

        fightButtonBackground.roundRect(0, 0, buttonWidth, buttonHeight, 10);
        fightButtonBackground.fill(0xe76f51);
        this.fightButton.addChild(fightButtonBackground);

        const fightButtonText = new PIXI.Text({ text: "FIGHT IT", style: buttonStyle });
        fightButtonText.anchor.set(0.5);
        fightButtonText.position.set(buttonWidth / 2, buttonHeight / 2);
        this.fightButton.addChild(fightButtonText);

        this.fightButton.interactive = true;
        this.fightButton.cursor = "pointer";
        this.fightButton.position.set(this.app.renderer.width / 2, this.app.renderer.height - 180);

        this.fightButton.on("pointerover", () => {
            fightButtonBackground.tint = 0xff0000;
        });
        this.fightButton.on("pointerout", () => {
            fightButtonBackground.tint = 0xffffff;
        });

        this.fightButton.on("pointerdown", () => {
            this.onFight?.(cardName);
            this.hide();
        });

        this.app.stage.addChild(this.fightButton);
    }
}
