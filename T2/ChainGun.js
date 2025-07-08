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

    addChainGun() {

    }

    shootBall() {
        this.#action = this.#spriteMixer.Action(this.#actionSprite, 0, 4, 20)
        this.#action.playLoop(); // trocar para playLoop e ver um método de parar ao soltar o clique

        const initialPosition = this.#actionSprite.getWorldPosition(new Vector3())
        console.log(initialPosition)

        const direction = new THREE.Vector3();
        this.#actionSprite.getWorldDirection(direction);
        direction.negate() //estava indo na direção contrária

        const raycaster = new THREE.Raycaster(initialPosition, direction.normalize());

        // ---------------------- apenas para ver a direção atraves da linha ---------------------
        // const length = 10; // tamanho da linha
        // const endPoint = new THREE.Vector3().copy(initialPosition).add(direction.clone().multiplyScalar(length));

        // const geometry = new THREE.BufferGeometry().setFromPoints([
        //     initialPosition,
        //     endPoint
        // ]);

        // const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // const line = new THREE.Line(geometry, material);
        // this.#scene.add(line);

        //-----------------------------considerar apenas os inimigos para efeitos de danos
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
        this.#spriteMixer.update(delta)
    }

    stopAction() {
        this.#action.stop();
    }

    remove() {
        this.#camera.remove(this.#actionSprite)
        this.#actionSprite = null
        this.#action = null
    }
}