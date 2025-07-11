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
    #catch = true

    constructor(scene, object, camera) {
        this.#scene = scene;
        this.#camera = camera;
        this.object = object;
        this.#gun = new Gun(camera, scene);
        this.keys = [];
        this.activeGun = this.#gun

    }

    handlePlayer() {
        if (this.activeGun == this.#gun)
            this.#gun.handleGun();
    }

    #switchGun(newGun) {
        if (this.activeGun === newGun) return;

        if (this.activeGun === this.#gun)
            this.#gun.remove();
        else
            this.#chainGun.remove();

        if (newGun === this.#gun) {
            this.#gun = new Gun(this.#camera, this.#scene)
            this.activeGun = this.#gun
        }
        else if (newGun === this.#chainGun) {
            this.#chainGun = new ChainGun(this.#camera, this.#scene)
            this.activeGun = this.#chainGun
        }
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
                this.#intervalShoot = setInterval(() => {

                    const now = Date.now();
                    if (this.#shoot && now - this.#lastShotTime >= 500) {
                        this.activeGun.shootBall();
                        this.#lastShotTime = now;
                    }
                }, 50);
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
            if (event.key === '1') {
                this.#switchGun(this.#chainGun)
            }
            else if (event.key === '2') {
                this.#switchGun(this.#gun)
            }
        });

        document.addEventListener('wheel', (event) => {
            if (this.activeGun == this.#chainGun)
                this.#switchGun(this.#gun);
            else
                this.#switchGun(this.#chainGun)
        });
    }

    addKey(key) {
        let position = this.#camera.getWorldPosition(new THREE.Vector3())
        let distance = key.position.distanceTo(position)
        if (distance < 3.5 && this.#catch) {
            this.keys.push(key)
            key.removeKey()
            this.#catch = false;
        }
    }

}