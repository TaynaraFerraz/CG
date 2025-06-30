import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class Cacodemon extends Enemy {
    #randomized = false;

    constructor(object, player, collidables) {
        super(object, player, 20, collidables);
        object.name = "cacodemon";

        this.randomizerCallback();
    }


    randomizerCallback() {
        if (!this.dead) {
            if (this.angry) {
                if (this.#randomized) {
                    this.#randomized = false;

                    setTimeout(() => {
                        this.randomizerCallback();
                    }, 2000);
                } else {
                    this.#randomized = true;
                    this.randomizeQuaternion();

                    setTimeout(() => {
                        this.randomizerCallback();
                    }, 500);
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
                    this.object.translateZ(0.15);
                }
            } else {
                this.rotateTowardsQuaternion();
                this.object.translateZ(0.15);
            }
        } else {
            this.rotateTowardsQuaternion();
            this.object.translateZ(0.07);
        }
    }
};
