// src/components/Battle.tsx
import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { gsap } from "gsap";

const Battle: React.FC = () => {
    const pixiContainer = useRef<HTMLDivElement>(null);
    const app = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        if (!app.current && pixiContainer.current) {
            const playerSprite = PIXI.Sprite.from("path/to/player.png");
            const enemySprite = PIXI.Sprite.from("path/to/enemy.png");

            playerSprite.x = 100;
            playerSprite.y = app.current!.renderer.height / 2;
            enemySprite.x = app.current!.renderer.width - 200;
            enemySprite.y = app.current!.renderer.height / 2;

            app.current!.stage.addChild(playerSprite, enemySprite);

            const animateAttack = () => {
                gsap.to(playerSprite, { x: enemySprite.x - 50, duration: 0.5 })
                    .then(() => gsap.to(playerSprite, { x: 100, duration: 0.5 }));
            };

            animateAttack();
        }

        return () => {
            // Safely destroy PixiJS application on unmount
            app.current?.destroy(true, true);
            app.current = null;
        };
    }, []);

    return <div ref={pixiContainer}></div>;
};

export default Battle;
