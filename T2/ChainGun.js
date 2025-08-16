import { Vector3 } from "../build/three.module.js";
import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import * as THREE from 'three';
import { BulletsCollisionHandler } from "./BulletsCollisionHandler.js";
import { Collidables } from "./Collidables.js";

export class ChainGun {

    #camera
    #scene
    #actionSprite = null
    #spriteMixer
    #action
    #clock
    #bulletsCollisionHandler
    enemiesArea
    lastFrameTime
    currentFrame
    totalFrames
    isFiring
    #shootSound;

    constructor(camera, scene, bulletsCollisionHandler, enemiesArea) {
        this.#camera = camera
        this.#clock = new THREE.Clock()
        this.#scene = scene
        this.enemiesArea = enemiesArea
        this.#spriteMixer = SpriteMixer();
        this.#bulletsCollisionHandler = bulletsCollisionHandler
        this.lastFrameTime = performance.now();
        this.currentFrame = 0;
        this.totalFrames = 3;
        this.isFiring = false

        let loader = new THREE.TextureLoader();
        loader.load("./assets/guns/spriteChainGun.png", (texture) => {
            this.#actionSprite = this.#spriteMixer.ActionSprite(texture, 5, 1);
            this.#actionSprite.setFrame(0, 0);
            this.#actionSprite.castShadow = true;
            this.#actionSprite.position.set(0, -0.1, -0.3);
            this.#actionSprite.scale.set(0.1, 0.1, 0.1);
        })

        const listener = new THREE.AudioListener();
        camera.add(listener);
        this.#shootSound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../0_assetsT3/sounds/rocketFiring.wav', (buffer) => {
            this.#shootSound.setBuffer(buffer);
            this.#shootSound.setVolume(0.5);
        });
    }

    add() {
        this.#camera.add(this.#actionSprite);
    }

    handleGun() {
        this.#bulletsCollisionHandler.handleCollisionsGun(Collidables.collidables, this.enemiesArea);
    }

    shootBall() {
        if (!this.#actionSprite) return;

        if (this.#shootSound.isPlaying) {
            this.#shootSound.stop();
        }
        this.#shootSound.play();

        // Só inicia a animação uma vez
        if (!this.isFiring) {
            this.#action = this.#spriteMixer.Action(this.#actionSprite, 100, 0, 0, 0, 4);
            this.isFiring = true;
            this.#action.playLoop();
        }

        const initialPosition = this.#actionSprite.getWorldPosition(new Vector3())
        console.log(initialPosition)

        const direction = new THREE.Vector3();
        this.#actionSprite.getWorldDirection(direction);
        direction.negate() //estava indo na direção contrária

        const raycaster = new THREE.Raycaster(initialPosition, direction.normalize());

        console.log(this.enemiesArea.inimigos, 'chaingun')
        const allEnemies = Object.values(this.enemiesArea.inimigos).flat();
        const enemyMeshes = allEnemies.map(e => e.object).filter(Boolean);

        console.log(enemyMeshes)

        //raio para identificar objetos nessa direção
        const collidableMeshes = [
            ...Collidables.collidables.areas.map(obj => obj.mesh),
            ...Collidables.collidables.walls.map(obj => obj.mesh),
            ...enemyMeshes
        ];
        raycaster.camera = this.#camera;
        const intersect = raycaster.intersectObjects(collidableMeshes, true);
        
        if (intersect.length > 0) {
            const hit = intersect[0].object

            const enemyHit = allEnemies.find(e =>
                e.object === hit || e.object.children.includes(hit) || e.object.getObjectById(hit.id) !== undefined
            );

            if (enemyHit) {
                console.log('colidiu com inimigo')
                console.log(enemyHit)
                enemyHit.damage(1)
            }
            else
                console.log('colidiu normal')

        }
    }

    spriteUpdate() {
        const delta = this.#clock.getDelta();
        this.#spriteMixer.update(delta);
    }

    stopAction() {
        if (this.#action) {
            this.#action.stop();
        }
        this.isFiring = false;
    }

    remove() {
        this.#camera.remove(this.#actionSprite)
    }
}