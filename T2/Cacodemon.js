import { setDefaultMaterial } from "../libs/util/util.js";
import { BulletsCollisionHandler } from "./BulletsCollisionHandler.js";
import { scene, camera, globalPlayer } from "./camera.js";
import { Collidables } from "./Collidables.js";
import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class Cacodemon extends Enemy {
    #randomized = false;
    #canShoot = true;
    #bulletsCollisionHandler;
    #injuredSound;
    #attackSound;

    constructor(object, player, initialPosition) {
        super(object, player, 40, undefined, initialPosition);
        object.name = "cacodemon";
        this.#bulletsCollisionHandler = new BulletsCollisionHandler(scene, this.object);
        this.#bulletsCollisionHandler.speed = 1.2;

        const listener = new THREE.AudioListener();
        camera.add(listener);

        this.#injuredSound = new THREE.Audio(listener);
        this.#attackSound = new THREE.Audio(listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonInjured.wav', (buffer) => {
            this.#injuredSound.setBuffer(buffer);
            this.#injuredSound.setVolume(0.5);
        });
        
        audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonAttack.wav', (buffer) => {
            this.#attackSound.setBuffer(buffer);
            this.#attackSound.setVolume(0.5);
        });
        
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
        this.playAttackSound();
        let worldPosition = new THREE.Vector3();
        this.object.getWorldPosition(worldPosition);

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const materialSphere = new THREE.MeshLambertMaterial({
            color: '#c2a500'
        });
        let sphere = new THREE.Mesh(sphereGeometry, materialSphere);
        sphere.name = "cacodemon_shot"
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

    handle() {
        if (!this.dying) {
            this.handleMovement();
            this.handleShooting();
        }
        this.handleCollisions();
        this.handleHealth();
        this.#bulletsCollisionHandler.handleCollisionsGun(Collidables.collidables, {inimigos: {player: [globalPlayer]}}, 8);
    }
};