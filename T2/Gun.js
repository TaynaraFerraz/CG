import * as THREE from 'three';
import { BulletsCollisionHandler } from './BulletsCollisionHandler.js';
import { Collidables } from './Collidables.js';
import { PLAYER_HEIGHT } from './constants.js';

export class Gun {
    #arma
    #camera
    #scene
    #bulletsCollisionHandler

    constructor(camera, scene, bulletsCollisionHandler) {
        this.#camera = camera;
        this.#scene = scene;
        this.#bulletsCollisionHandler = bulletsCollisionHandler

        const armaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 32);
        const armaMaterial = new THREE.MeshLambertMaterial({
            color: '#3b3b3b'
        })
        const arma = new THREE.Mesh(armaGeometry, armaMaterial);
        arma.rotateX(Math.PI / 2);
        this.#arma = arma;
    }

    add() {
        this.#scene.add(this.#arma);
        this.#camera.add(this.#arma);
        this.#arma.position.set(0, -0.1, -0.1); // direita, baixo, frente
    }

    shootBall() {
        let armaMundo = new THREE.Vector3();
        this.#arma.getWorldPosition(armaMundo); // pega as coordenadas globais da arma

        let worldPosition = new THREE.Vector3();
        this.#camera.getWorldPosition(worldPosition)

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const materialSphere = new THREE.MeshLambertMaterial({
            color: '#7a7a7a'
        });
        let sphere = new THREE.Mesh(sphereGeometry, materialSphere);

        sphere.position.copy(armaMundo);

        this.#scene.add(sphere);
        this.#bulletsCollisionHandler.addSphere(sphere);
    }

    remove() {
        this.#camera.remove(this.#arma)
    }

    handleGun() {
        this.#bulletsCollisionHandler.handleBulletsCollisions(Collidables.collidables);
        //console.log(this.#arma.position);
    }
}