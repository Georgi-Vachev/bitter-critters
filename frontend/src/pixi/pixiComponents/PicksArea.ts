import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import Card from "./Card";

export default class PicksArea extends PIXI.Container {
    protected _background!: PIXI.Graphics;
    protected _text!: PIXI.Container;
    protected _leftCardSprite: PIXI.Sprite | null = null;
    protected _rightCardSprite: PIXI.Sprite | null = null;
    protected _leftCard: Card | null = null;
    protected _rightCard: Card | null = null;
    protected _leftButtons: PIXI.Container | null = null;
    protected _rightButtons: PIXI.Container | null = null;
    protected _leftRandomButton!: PIXI.Container;
    protected _rightRandomButton!: PIXI.Container;
    protected _battleButton!: PIXI.Container;
    protected _addRandomCard: (side: "left" | "right") => void;
    protected _onBattleStart: () => void;
    protected readonly _appWidth: number;
    protected readonly _appHeight: number;

    constructor(appWidth: number, appHeight: number, addRandomCard: (side: "left" | "right") => void, onBattleStart: () => void) {
        super();
        this._appWidth = appWidth;
        this._appHeight = appHeight;
        this.width = appWidth;
        this.height = 100;

        this._addRandomCard = addRandomCard;
        this._onBattleStart = onBattleStart;

        this.createBackground();
        this.createPlaceholderButtons();
        this.createBattleButton();
    }

    get chosenCards(): { left: Card | null; right: Card | null } {
        return { left: this._leftCard, right: this._rightCard };
    }

    get chosenCardSprites(): { leftCardSprite: PIXI.Sprite | null; rightCardSprite: PIXI.Sprite | null } {
        return { leftCardSprite: this._leftCardSprite, rightCardSprite: this._rightCardSprite };
    }

    public removeChosenCards(): { leftCardSprite: PIXI.Sprite | null; rightCardSprite: PIXI.Sprite | null } {
        this.removeChild(this._leftCardSprite!, this._rightCardSprite!);

        return { leftCardSprite: this._leftCardSprite, rightCardSprite: this._rightCardSprite };
    }

    public animateIntro(): Promise<void> {
        return new Promise((resolve) => {
            const duration = 1.5;

            gsap.to(this._background, {
                y: this._appHeight,
                duration: duration,
                ease: "back.inOut"
            });

            const leftSpriteProps = { scaleX: this._leftCardSprite!.scale.x, scaleY: this._leftCardSprite!.scale.y, y: this._leftCardSprite!.y, x: this._leftCardSprite!.x };
            const rightSpriteProps = { scaleX: this._rightCardSprite!.scale.x, scaleY: this._rightCardSprite!.scale.y, y: this._rightCardSprite!.y, x: this._rightCardSprite!.x };

            const leftAnimation = gsap.to(leftSpriteProps, {
                x: this._appWidth * 0.3,
                y: this._appHeight * 0.4 - this._leftCardSprite!.height,
                scaleX: -6,
                scaleY: 6,
                duration: duration,
                ease: "back.inOut",
                onUpdate: () => {
                    this._leftCardSprite!.scale.set(leftSpriteProps.scaleX, leftSpriteProps.scaleY);
                    this._leftCardSprite!.y = leftSpriteProps.y;
                    this._leftCardSprite!.x = leftSpriteProps.x;
                }
            });

            const rightAnimation = gsap.to(rightSpriteProps, {
                x: this._appWidth * 0.7,
                y: this._appHeight * 0.4 - this._rightCardSprite!.height,
                scaleX: 6,
                scaleY: 6,
                duration: duration,
                ease: "back.inOut",
                onUpdate: () => {
                    this._rightCardSprite!.scale.set(rightSpriteProps.scaleX, rightSpriteProps.scaleY);
                    this._rightCardSprite!.y = rightSpriteProps.y;
                    this._rightCardSprite!.x = rightSpriteProps.x;

                }
            });

            Promise.all([leftAnimation, rightAnimation]).then(() => resolve());
        });
    }


    protected createBackground(): void {
        const backgroundWidth = this._appWidth * 0.4;
        const backgroundHeight = 220;
        const backgroundX = this._appWidth / 2 - backgroundWidth / 2;
        const backgroundY = this._appHeight - backgroundHeight;
        const cornerRadius = 45;

        this._background = new PIXI.Graphics();
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
        this._background.fill(0x777777);

        this._text = this.createText();
        this._background.addChild(this._text);

        this.addChild(this._background);
    }

    protected createText(): PIXI.Container {
        const style1 = new PIXI.TextStyle({
            fontSize: 42,
            fill: 0xffffff,
            align: "center",
            fontFamily: "Comic Sans MS, Verdana, Futura",
        });

        const style2 = new PIXI.TextStyle({
            fontSize: 42,
            fill: 0xebcd34,
            fontWeight: "bold",
            align: "center",
            fontFamily: "Comic Sans MS, Verdana, Futura",
        });

        const text1 = new PIXI.Text("Make your choice\nor\n", style1);
        const text2 = new PIXI.Text("Roll the dice with '?'", style2);

        text1.anchor.set(0.5);
        text2.anchor.set(0.5);

        const text = new PIXI.Container();
        text.addChild(text1, text2);

        text2.position.set(0, text2.height);
        text.position.set(this._appWidth / 2, this._appHeight - this._background.height / 2);

        return text;
    }

    protected createPlaceholderButtons(): void {
        this._leftRandomButton = this.createActionBox(0xebcd34, "?", 100, 15);
        this._leftRandomButton.position.set(
            this._appWidth / 2 - this._background.width / 2 + this._leftRandomButton.width / 2,
            this._appHeight - this._background.height / 2 - this._leftRandomButton.height / 2
        );
        this._leftRandomButton.on("pointerdown", () => {
            this._addRandomCard("left")
        });

        this._rightRandomButton = this.createActionBox(0xebcd34, "?", 100, 15);
        this._rightRandomButton.position.set(
            this._appWidth / 2 + this._background.width / 2 - this._rightRandomButton.width * 1.5,
            this._appHeight - this._background.height / 2 - this._rightRandomButton.height / 2
        );
        this._rightRandomButton.on("pointerdown", () => {
            this._addRandomCard("right")
        });

        this._background.addChild(this._leftRandomButton, this._rightRandomButton);
    }

    protected createBattleButton(): void {
        this._battleButton = new PIXI.Container();

        const buttonBackground = new PIXI.Graphics();
        buttonBackground.roundRect(0, 0, 360, 100, 25);
        buttonBackground.fill(0xffffff);
        this._battleButton.addChild(buttonBackground);

        const buttonText = new PIXI.Text("Battle!", {
            fontSize: 50,
            fontWeight: "bold",
            fill: "white",
            align: "center",
            fontFamily: "Comic Sans MS, Verdana, Futura",
        });

        buttonText.anchor.set(0.5);
        buttonText.position.set(buttonBackground.width / 2, buttonBackground.height / 2);
        this._battleButton.addChild(buttonText);

        this._battleButton.interactive = true;
        this._battleButton.cursor = "pointer";

        this._battleButton.position.set(
            this._appWidth / 2,
            (this._appHeight - this._background.height / 2)
        );

        this._battleButton.pivot.set(buttonBackground.width / 2, buttonBackground.height / 2);

        let isHovered = false;

        this._battleButton.on("pointerover", () => {
            isHovered = true;
            gsap.to(this._battleButton.scale, {
                x: 1.1,
                y: 1.1,
                duration: 0.1,
            });
        });

        this._battleButton.on("pointerout", () => {
            isHovered = false;
            gsap.to(this._battleButton.scale, {
                x: 1,
                y: 1,
                duration: 0.1,
            });
        });

        this._battleButton.on("pointerdown", () => {
            gsap.to(this._battleButton.scale, {
                x: 0.975,
                y: 0.975,
                duration: 0.05,
            });
        });

        this._battleButton.on("pointerup", () => {
            if (isHovered) {
                this._onBattleStart();
                gsap.to(this._battleButton.scale, {
                    x: 1.075,
                    y: 1.075,
                    duration: 0.075,
                });
            } else {
                gsap.to(this._battleButton.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.75,
                });
            }
        });

        const changeColor = () => {
            const color = PIXI.Color.shared.setValue([
                (Math.sin(Date.now() * 0.0007) + 1) / 2,
                (Math.sin(Date.now() * 0.0007 + 2) + 1) / 2,
                (Math.sin(Date.now() * 0.0007 + 4) + 1) / 2,
            ]).toHex();
            buttonBackground.tint = color;
            requestAnimationFrame(changeColor);
        };

        changeColor();

        this._battleButton.visible = false;
        this._background.addChild(this._battleButton);
    }

    protected createActionBox(color: number, label: string, size: number, radius: number): PIXI.Container {
        const box = new PIXI.Container();
        const boxGraphics = new PIXI.Graphics();

        boxGraphics.roundRect(0, 0, size, size);
        boxGraphics.fill(color);

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

    public addCard(card: Card, position: "left" | "right"): void {
        const isLeft = position === "left";

        isLeft ? this._leftCard = card : this._rightCard = card;
        const oldCardSprite = isLeft ? this._leftCardSprite : this._rightCardSprite;
        const oldButtons = isLeft ? this._leftButtons : this._rightButtons;
        const randomButton = isLeft ? this._leftRandomButton : this._rightRandomButton;

        if (oldCardSprite) this.removeChild(oldCardSprite);
        if (oldButtons) this._background.removeChild(oldButtons);

        const cardSprite = new PIXI.Sprite(card.cardTexture);
        cardSprite.width = 200;
        cardSprite.height = 200;
        cardSprite.position.set(
            isLeft
                ? this._appWidth / 2 - cardSprite.width * 1.1
                : this._appWidth / 2 + cardSprite.width * 1.1,
            this._appHeight - 200
        );

        if (isLeft) {
            cardSprite.scale.x *= -1;
            this._leftCardSprite = cardSprite;
            this._leftButtons = this.createCardSpriteButtons(position);
        } else {
            this._rightCardSprite = cardSprite;
            this._rightButtons = this.createCardSpriteButtons(position);
        }

        this._background.removeChild(randomButton);
        this._background.addChild(isLeft ? this._leftButtons! : this._rightButtons!);
        this.addChild(cardSprite);

        this.updateTextVisibility();
    }

    protected createCardSpriteButtons(position: "left" | "right"): PIXI.Container {
        const container = new PIXI.Container();

        const xButton = this.createActionBox(0xff0000, "X", 75, 1);
        xButton.position.set(
            position === "left"
                ? this._appWidth / 2 - this._background.width / 2 + xButton.width / 5
                : this._appWidth / 2 + this._background.width / 2 - xButton.width * 1.2,
            (this._appHeight - this._background.height / 2) - xButton.height * 1.25
        );
        xButton.on("pointerdown", () => this.removeCardSprite(position));

        const questionButton = this.createActionBox(0xebcd34, "?", 75, 1);
        questionButton.position.set(
            position === "left"
                ? this._appWidth / 2 - this._background.width / 2 + questionButton.width / 5
                : this._appWidth / 2 + this._background.width / 2 - questionButton.width * 1.2,
            (this._appHeight - this._background.height / 2) + questionButton.height / 3.5
        );
        questionButton.on("pointerdown", () => {
            this._addRandomCard(position);
        });

        container.addChild(xButton, questionButton);
        return container;
    }

    protected removeCardSprite(position: "left" | "right"): void {
        const isLeft = position === "left";
        const cardSprite = isLeft ? this._leftCardSprite : this._rightCardSprite;
        const buttons = isLeft ? this._leftButtons : this._rightButtons;
        const randomButton = isLeft ? this._leftRandomButton : this._rightRandomButton;

        if (cardSprite) this.removeChild(cardSprite);
        if (buttons) this._background.removeChild(buttons);

        this._background.addChild(randomButton);

        if (isLeft) this._leftCardSprite = null;
        else this._rightCardSprite = null;

        this.updateTextVisibility();
    }

    protected updateTextVisibility(): void {
        if (!this._leftCardSprite || !this._rightCardSprite) {
            if (!this._text.parent) this._background.addChild(this._text);
            this._battleButton.visible = false;
        } else {
            if (this._text.parent) this._text.parent.removeChild(this._text);
            this._battleButton.visible = true;
        }
    }
}
