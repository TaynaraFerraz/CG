import { Vector3 } from "../build/three.module.js";
import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import * as THREE from 'three';

export class ChainGun {

    #camera
    #scene
    #actionSprite = null
    #spriteMixer
    #action
    #clock

    constructor(camera, scene) {
        this.#camera = camera
        this.#clock = new THREE.Clock()
        this.#scene = scene
    }

    addChainGun() {
        this.#spriteMixer = SpriteMixer();

        let loader = new THREE.TextureLoader();
        loader.load("./spriteChainGun.png", (texture) => {
            this.#actionSprite = this.#spriteMixer.ActionSprite(texture, 5, 1);
            this.#actionSprite.setFrame(0);
            this.#actionSprite.castShadow = true;
            this.#actionSprite.position.set(0, -0.1, -0.3);
            this.#actionSprite.scale.set(0.10, 0.10, 0.10);
            this.#camera.add(this.#actionSprite);
        })
    }

    shootBall() {
        this.#action = this.#spriteMixer.Action(this.#actionSprite, 0, 4, 20)
        this.#action.playOnce(); // trocar para playLoop e ver um método de parar ao soltar o clique

        const initialPosition = this.#actionSprite.getWorldPosition(new Vector3())
        console.log(initialPosition)

        const direction = new THREE.Vector3();
        this.#actionSprite.getWorldDirection(direction);
        direction.negate() //estava indo na direção contrária

        const raycaster = new THREE.Raycaster(initialPosition, direction.normalize());

        //considerar apenas os inimigos para efeitos de danos
        // const collidableMeshes = [
        //     ...collidables.areas.map(obj => obj.mesh),
        //     ...collidables.walls.map(obj => obj.mesh),
        // ];

        // const intersect = raycaster.intersectObjects(collidableMeshes, true);

        // if (intersect.length > 0 ) {
        //     console.log("colidiu")
        // }

    }

    spriteUpdate() {
        let delta = this.#clock.getDelta()
        //console.log(delta)
        this.#spriteMixer.update(delta)
    }

    remove() {
        this.#camera.remove(this.#actionSprite)
        this.#actionSprite = null
        this.#action = null
    }
}