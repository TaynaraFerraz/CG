import * as THREE from 'three';
import { BulletsCollisionHandler } from './BulletsCollisionHandler.js';
import { setDefaultMaterial } from '../libs/util/util.js';

export class Gun {

    #arma
    #camera
    #scene
    #bulletsCollisionHandler

    constructor(camera, scene, bulletsCollisionHandler) {
        this.#camera = camera;
        this.#scene = scene;
        this.#bulletsCollisionHandler = bulletsCollisionHandler;
    }

    createGun() {
        const armaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 32);
        const arma = new THREE.Mesh(armaGeometry, setDefaultMaterial('#3b3b3b'));
        arma.rotateX(Math.PI / 2);

        arma.position.set(0, -0.1, -0.1); // direita, baixo, frente
        this.#arma = arma;
        this.#camera.add(arma);
    }

    shootBall() {
        let armaMundo = new THREE.Vector3();
        this.#arma.getWorldPosition(armaMundo); // pega as coordenadas globais da arma

        let worldPosition = new THREE.Vector3();
        this.#camera.getWorldPosition(worldPosition)

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        const materialSphere = setDefaultMaterial('#7a7a7a');
        let sphere = new THREE.Mesh(sphereGeometry, materialSphere);

        sphere.position.copy(armaMundo);

        this.#scene.add(sphere);
        this.#bulletsCollisionHandler.addSphere(sphere);
    }
}