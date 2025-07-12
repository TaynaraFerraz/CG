import * as THREE from 'three';
import { ChainGun } from "./ChainGun.js";
import { Gun } from "./Gun.js";

export class Player {

    #scene
    #camera
    object
    #gun
    #chainGun
    activeGun
    keys = []
    #shoot = false
    #intervalShoot
    #lastShotTime = 0
    bulletsCollisionHandler
    enemiesAreas

    constructor(scene, object, camera, bulletsCollisionHandler, enemiesAreas) {
        this.#scene = scene;
        this.#camera = camera;
        this.object = object;
        this.enemiesAreas = enemiesAreas
        this.bulletsCollisionHandler = bulletsCollisionHandler
        this.#gun = new Gun(camera, scene, bulletsCollisionHandler, enemiesAreas);
        this.#chainGun = new ChainGun(camera, scene, bulletsCollisionHandler, enemiesAreas)
        this.keys = [];
        this.activeGun = this.#gun
        this.activeGun.add()
    }

    handlePlayer() {
        this.activeGun.handleGun();
    }

    #switchGun(newGun) {
        if (this.activeGun === newGun) return;

        this.activeGun.remove()
        this.activeGun = newGun
        this.activeGun.add()
    }

    actions(controls) {

        document.addEventListener('mousedown', (event) => {
            if (!controls.isLocked) return;
            if (event.button !== 0 && event.button !== 2) return;
            this.#shoot = true;

            if (this.activeGun === this.#chainGun) {
                this.activeGun.shootBall(); // dispara imediatamente
                this.#intervalShoot = setInterval(() => {
                    if (this.#shoot) {
                        this.activeGun.shootBall(); // disparo contínuo
                    }
                }, 50); // verifica a cada 50ms para caso não estiver mais disparando

            } else {
                const shoot = () => {
                    const now = Date.now();
                    if (this.#shoot && now - this.#lastShotTime >= 500) {
                        this.activeGun.shootBall();
                        this.#lastShotTime = now;
                    }
                }
                shoot();
                this.#intervalShoot = setInterval(() => {
                    shoot();
                }, 100);
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button !== 0 && event.button !== 2) return;

            if (this.activeGun == this.#chainGun)
                this.activeGun.stopAction()

            this.#shoot = false;
            clearInterval(this.#intervalShoot);
        });

        document.addEventListener('keydown', (event) => {
            if (!controls.isLocked) return;
            if (event.key === '1') {
                this.#switchGun(this.#chainGun)
            }
            else if (event.key === '2') {
                this.#switchGun(this.#gun)
            }
        });

        document.addEventListener('wheel', (event) => {
            if (!controls.isLocked) return;
            if (this.activeGun == this.#chainGun)
                this.#switchGun(this.#gun);
            else
                this.#switchGun(this.#chainGun)
        });
    }

    addKey(key) {
        let position = this.#camera.getWorldPosition(new THREE.Vector3())
        let positionKey = key.csgFinal.getWorldPosition(new THREE.Vector3())

        let distance = positionKey.distanceTo(position)
        if (distance < 3.5) {
            this.keys.push(key)
            key.removeKey();
        }
        //console.log(this.keys)

    }

}