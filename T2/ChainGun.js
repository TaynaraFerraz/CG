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

    constructor(camera, scene, bulletsCollisionHandler, enemiesArea) {
        this.#camera = camera
        this.#clock = new THREE.Clock()
        this.#scene = scene
        this.enemiesArea = enemiesArea
        this.#spriteMixer = SpriteMixer();
        this.#bulletsCollisionHandler = bulletsCollisionHandler

        let loader = new THREE.TextureLoader();
        loader.load("./spriteChainGun.png", (texture) => {
            this.#actionSprite = this.#spriteMixer.ActionSprite(texture, 5, 1);
            this.#actionSprite.setFrame(0);
            this.#actionSprite.castShadow = true;
            this.#actionSprite.position.set(0, -0.1, -0.3);
            this.#actionSprite.scale.set(0.10, 0.10, 0.10);
        })
    }

    add() {
        this.#camera.add(this.#actionSprite);
    }

    handleGun() {
        this.#bulletsCollisionHandler.handleCollisionsGun(Collidables.collidables, this.enemiesArea);
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

        console.log(this.enemiesArea.inimigos, 'chaingun')
        const allEnemies = Object.values(this.enemiesArea.inimigos).flat();
        const enemyMeshes = allEnemies.map(e => e.object).filter(Boolean);

        console.log(enemyMeshes)

        //raio para identificar objetos nessa direção
        const intersect = raycaster.intersectObjects(enemyMeshes, true);

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
            let delta = this.#clock.getDelta()
            this.#spriteMixer.update(delta)
        }

        stopAction() {
            this.#action.stop();
        }

        remove() {
            this.#camera.remove(this.#actionSprite)
        }
    }