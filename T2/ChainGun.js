import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import * as THREE from 'three';

export class ChainGun {

    #camera

    constructor(camera) {
        this.#camera = camera
    }

    addChainGun() {
        let spriteMixer = SpriteMixer();
        let actionSprite;

        let loader = new THREE.TextureLoader();
        loader.load("./spriteChainGun.png", (texture) => {
            actionSprite = spriteMixer.ActionSprite(texture, 5, 1);
            actionSprite.setFrame(0);
            actionSprite.position.set(0, -0.1, -0.3);
            actionSprite.scale.set(0.10, 0.10, 0.10);
            this.#camera.add(actionSprite);
        })
    }
}