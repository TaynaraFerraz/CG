import * as THREE from 'three';
import { ChainGun } from "./ChainGun.js";
import { Gun } from "./Gun.js";
import { Area } from './createArea.js';
import { Key } from './Key.js';

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
    initialKey
    secondKey
    thirdkey

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

    #addKey(key) {
        let position = this.#camera.getWorldPosition(new THREE.Vector3())
        let positionKey = key.csgFinal.getWorldPosition(new THREE.Vector3())

        let distance = positionKey.distanceTo(position)
        if (distance < 3.5) {
            this.keys.push(key)
            key.removeKey();
        }
        //console.log(this.keys)
        key.visible = true
    }

    checkArea1(enemiesAreas) {
        console.log(this.initialKey)
        if (enemiesAreas.inimigos.area1.length === 0 && this.keys.length === 0) {
            if (!this.initialKey)
                this.initialKey = new Key("rgb(223, 47, 47)");
            else
                Area.primeiroAltar(this.initialKey);
        }

        if (this.initialKey && !this.initialKey.coletada && this.initialKey.visible) {
            this.#addKey(this.initialKey);
        }

        if (this.keys.length === 1 && this.initialKey.coletada) {
            let position = this.#camera.getWorldPosition(new THREE.Vector3())
            let target = new THREE.Vector3(37.5, 1.8, -92.0);
            let distance = position.distanceTo(target)
            if (distance < 3.5) {
                this.initialKey.csgFinal.position.set(37.5, 1.8, -92.0)
                this.initialKey.csgFinal.visible = true
                this.#scene.add(this.initialKey.csgFinal)
            }

            if (this.initialKey.csgFinal.position.equals(new THREE.Vector3(37.5, 1.8, -92.0)))
                Area.doorDown();
        }
    }

    checkArea2(enemiesAreas) {
        if (enemiesAreas.inimigos.area2.length === 0 && this.keys.length === 1) {
            if (!this.secondKey)
                this.secondKey = new Key("rgba(247, 231, 15, 1)");
            else
                Area.segundoAltar(this.secondKey.csgFinal);
        }

        if (this.secondKey && !this.secondKey.coletada) {
            this.#addKey(this.secondKey);
        }
    }

    checkArea3(enemiesAreas) {
        if (enemiesAreas.inimigos.area3.length === 0 ) {
            if (!this.thirdkey)
                this.thirdkey = new Key("rgba(15, 108, 247, 1)");
            else
                Area.terceiroAltar(this.thirdkey.csgFinal);
        }

        if (this.thirdkey && !this.thirdkey.coletada) {
            this.#addKey(this.thirdkey);
        }
    }

}