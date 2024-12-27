import * as PIXI from "pixi.js";

export default class Arena extends PIXI.Container {
    constructor(app: PIXI.Application) {
        super();

        // const onBattle = () => {
        //     const { left, right } = this._picksArea.selectedCreatures;
        //     if (left && right) {
        //         this.startBattle(left, right); // Handle battle logic
        //     }
        // };
    }

    // private startBattle(left: PIXI.Sprite, right: PIXI.Sprite): void {
    //     console.log("Battle begins between:", left, right);
    //     // Battle logic here
    // }
}
