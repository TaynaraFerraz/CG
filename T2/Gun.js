import * as THREE from 'three';
import { BulletsCollisionHandler } from './BulletsCollisionHandler.js';
import { Collidables } from './Collidables.js';
import { PLAYER_HEIGHT } from './constants.js';
import { SpriteMixer } from '../libs/sprites/SpriteMixer.js';
import { Vector3 } from '../build/three.module.js';

export class Gun {
    #arma
    #camera
    #scene
    #bulletsCollisionHandler
    enemiesAreas
    #actionSprite = null
    #spriteMixer
    #action
    #clock
    isFiring
    onLoaded = null;
    #shootSound;

    constructor(camera, scene, bulletsCollisionHandler, enemiesAreas) {
        this.#camera = camera;
        this.#clock = new THREE.Clock()
        this.#scene = scene;
        this.enemiesAreas = enemiesAreas
        this.#bulletsCollisionHandler = bulletsCollisionHandler
        this.#spriteMixer = SpriteMixer();
        let loader = new THREE.TextureLoader();
        loader.load("./assets/guns/gun.png", (texture) => {
            this.#actionSprite = this.#spriteMixer.ActionSprite(texture, 4, 1);
            this.#actionSprite.setFrame(0, 0);
            this.#actionSprite.castShadow = true;
            this.#actionSprite.position.set(0, -0.1, -0.35);
            this.#actionSprite.scale.set(0.1, 0.1, 0.1);

            if (typeof this.onLoaded === "function") {
                this.onLoaded();
            }
        })


        // Carrega o som de disparo
        const listener = new THREE.AudioListener();
        camera.add(listener);
        this.#shootSound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../0_assetsT3/sounds/rocketFiring.wav', (buffer) => {
            this.#shootSound.setBuffer(buffer);
            this.#shootSound.setVolume(0.5);
        });
    }

    add() {
        this.#camera.add(this.#actionSprite);
    }

    shootBall() {
        // Toca o som de disparo
        if (this.#shootSound.isPlaying) {
            this.#shootSound.stop();
        }
        this.#shootSound.play();

        if (!this.#actionSprite) return;

        this.#action = this.#spriteMixer.Action(this.#actionSprite, 100, 0, 0, 0, 3);
        this.isFiring = true;
        this.#action.playOnce();

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const materialSphere = new THREE.MeshLambertMaterial({
            color: '#7a7a7a'
        });
        let sphere = new THREE.Mesh(sphereGeometry, materialSphere);

        sphere.position.copy(this.#actionSprite.getWorldPosition(new Vector3()));

        this.#scene.add(sphere);
        this.#bulletsCollisionHandler.addSphere(sphere);
    }

    spriteUpdate() {
        const delta = this.#clock.getDelta();
        this.#spriteMixer.update(delta);
    }

    remove() {
        this.#camera.remove(this.#actionSprite)
    }

    handleGun() {
        this.#bulletsCollisionHandler.handleCollisionsGun(Collidables.collidables, this.enemiesAreas);
    }
}