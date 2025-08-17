import { EnemiesHandler } from "./EnemiesHandler.js";
import { scene } from "./camera.js";
import { Collidables } from "./Collidables.js";
import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class PainElemental extends Enemy {
    #randomized = false;
    #canShoot = true;
    #remainingSkulls = 1;
    enemiesHandler;

    constructor(object, player, initialPosition, enemiesHandler) {
        super(object, player, 40, undefined, initialPosition);
        object.name = "painelemental";

        this.enemiesHandler = enemiesHandler;
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
        if(this.#remainingSkulls > 0){
            this.enemiesHandler.addEnemy("lostsoul", this.object.position, true);
            this.#remainingSkulls--;

        }
    }

    handleShooting() {
        if (!this.#randomized && this.angry && this.#canShoot) {
            this.#shoot();
            this.#canShoot = false;

            setTimeout(() => {
                this.#canShoot = true;
            }, 10000);
        }
    }

    handle() {
        this.angry = true;
        if (!this.dying) {
            this.handleMovement();
            this.handleShooting();
        }
        this.handleCollisions();
        this.handleHealth();
        //console.log("handle");
    }
};