import { setDefaultMaterial } from "../libs/util/util.js";
import { BulletsCollisionHandler } from "./BulletsCollisionHandler.js";
import { scene } from "./camera.js";
import { Collidables } from "./Collidables.js";
import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class Cacodemon extends Enemy {
    #randomized = false;
    #canShoot = true;
    #bulletsCollisionHandler;

    constructor(object, player, initialPosition) {
        super(object, player, 40, undefined, initialPosition);
        object.name = "cacodemon";
        this.#bulletsCollisionHandler = new BulletsCollisionHandler(scene, this.object);
        this.#bulletsCollisionHandler.speed = 4.5;

        this.randomizerCallback();
    }


    randomizerCallback() {
        if (!this.dead) {
            if (this.angry) {
                if (this.#randomized) {

                    setTimeout(() => {
                        this.#randomized = false;
                        this.randomizerCallback();
                    }, Math.random() * 1000 + 1000);
                } else {

                    setTimeout(() => {
                        this.#randomized = true;
                        this.randomizeQuaternion();
                        this.randomizerCallback();
                    }, Math.random() * 2500 + 1000);
                }
            } else {
                this.randomizeQuaternion();

                setTimeout(() => {
                    this.randomizerCallback();
                }, 1000);
            }
        }
    }

    handleMovement() {
        if (this.angry) {
            if (!this.#randomized) {
                this.lookAtPlayer();

                if (this.player.position.distanceTo(this.object.position) > 7) {
                    this.object.translateZ(0.08);
                }
            } else {
                this.rotateTowardsQuaternion();
                this.object.translateZ(0.08);
            }
        } else {
            this.rotateTowardsQuaternion();
            this.object.translateZ(0.04);
        }
    }

    #shoot() {
            let worldPosition = new THREE.Vector3();
            this.object.getWorldPosition(worldPosition);

            const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
            const materialSphere = setDefaultMaterial('#c2a500');
            let sphere = new THREE.Mesh(sphereGeometry, materialSphere);
            sphere.position.copy(worldPosition);

            scene.add(sphere);
            this.#bulletsCollisionHandler.addSphere(sphere);
    }

    handleShooting() {
        if (!this.#randomized && this.angry && this.#canShoot) {
            this.#shoot();
            this.#canShoot = false;

            setTimeout(() => {
                this.#canShoot = true;
            }, 800);
        }
    }

    handle() {
        if(!this.dying){
            this.handleMovement();
            this.handleShooting();
        }
        this.handleCollisions();
        this.handleHealth();
        this.#bulletsCollisionHandler.handleBulletsCollisions(Collidables.collidables);
    }
};