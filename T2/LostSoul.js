import { Enemy } from "./Enemy.js";
import * as THREE from 'three';
import { camera } from './camera.js';

export class LostSoul extends Enemy {
    #randomized = false;
    #dashing = false;
    #dashingTurnSpeed = 0.6;
    #dynamicTurnSpeed = this.#dashingTurnSpeed;
    #injuredSound;
    #attackSound;

    constructor(object, player, initialPosition) {
        super(object, player, 20, 2, initialPosition);
        object.name = "LostSoul";

        const listener = new THREE.AudioListener();
        camera.add(listener);

        this.#injuredSound = new THREE.Audio(listener);
        this.#attackSound = new THREE.Audio(listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../0_assetsT3/sounds/lostSoul/injured.wav', (buffer) => {
            this.#injuredSound.setBuffer(buffer);
            this.#injuredSound.setVolume(0.5);
        });
        
        audioLoader.load('../0_assetsT3/sounds/lostSoul/lost_soul_attack.wav', (buffer) => {
            this.#attackSound.setBuffer(buffer);
            this.#attackSound.setVolume(0.5);
        });

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
                    }, Math.random() * 200 + 800);
                } else {
                    
                    setTimeout(() => {
                        this.#randomized = true;
                        this.randomizeQuaternion();
                        this.randomizerCallback();
                    }, Math.random() * 1000 + 1000);
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
                const nextDash = Math.random() * 2000 + 2000;
                setTimeout(() => {
                    this.#dashing = true;
                    this.#dynamicTurnSpeed = this.#dashingTurnSpeed;
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
        if(!this.dying)
        if (this.angry) {
            const speed = this.#dashing ? 0.6 : 0.08;
            const turnSpeed = this.#dashing ? this.#dynamicTurnSpeed : undefined;

            if (this.#dashing) {
                this.#moveTowardsPlayer(turnSpeed, speed);
                this.#dynamicTurnSpeed *= 0.7;
            } else {
                if (!this.#randomized) {
                    this.#moveTowardsPlayer(turnSpeed, speed);
                } else {
                    this.rotateTowardsQuaternion();
                    this.object.translateZ(0.05);
                }
            }
        } else {
            this.rotateTowardsQuaternion();
            this.object.translateZ(0.07);
        }
    }

    playInjuredSound() {
        if (this.#injuredSound && this.#injuredSound.buffer) {
            if (this.#injuredSound.isPlaying) this.#injuredSound.stop();
            this.#injuredSound.play();
        }
        super.playInjuredSound();
    }

    playAttackSound() {
        if (this.#attackSound && this.#attackSound.buffer) {
            if (this.#attackSound.isPlaying) this.#attackSound.stop();
            this.#attackSound.play();
        }
        super.playAttackSound();
    }

    handle(){
        this.handleMovement();
        this.handleCollisions();
        this.handleHealth();
    }
};