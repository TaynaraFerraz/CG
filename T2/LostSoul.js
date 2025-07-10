import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class LostSoul extends Enemy {
    #randomized = false;
    #dashing = false;

    constructor(object, player) {
        super(object, player, 20, 2);
        object.name = "LostSoul";

        this.randomizerCallback();
        this.dashingCallBack();
    }


    randomizerCallback() {
        if (!this.dead) {
            if (this.angry) {
                if (this.#randomized) {
                    
                    setTimeout(() => {
                        this.#randomized = false;
                        this.randomizerCallback();
                    }, 800);
                } else {
                    
                    setTimeout(() => {
                        this.#randomized = true;
                        this.randomizeQuaternion();
                        this.randomizerCallback();
                    }, 1500);
                }
            } else {
                this.randomizeQuaternion();

                setTimeout(() => {
                    this.randomizerCallback();
                }, 1000);
            }
        }
    }

    dashingCallBack() {
        if (!this.dead) {
            if (this.#dashing) {
                setTimeout(() => {
                    this.#dashing = false;
                    this.dashingCallBack();
                }, 600);
            } else {
                const nextDash = Math.random() * 1000 + 3000;
                setTimeout(() => {
                    this.#dashing = true;
                    this.dashingCallBack();
                }, nextDash);
            }
        }
    }

    #moveTowardsPlayer(turnSpeed, speed){
        this.lookAtPlayer(turnSpeed);
        this.object.translateZ(speed);
    }

    handleMovement() {
        if (this.angry) {
            const speed = this.#dashing ? 0.6 : 0.08;
            const turnSpeed = this.#dashing ? 0.3 : undefined;

            if (this.#dashing) {
                this.#moveTowardsPlayer(turnSpeed, speed);           
            } else {
                if (!this.#randomized) {
                    this.#moveTowardsPlayer(turnSpeed, speed);
                } else {
                    this.rotateTowardsQuaternion();
                    this.object.translateZ(0.08);
                }
            }
        } else {
            this.rotateTowardsQuaternion();
            this.object.translateZ(0.04);
        }
    }

    handle(){
        this.handleMovement();
        this.handleCollisions();
        this.handleHealthBar();
    }
};
