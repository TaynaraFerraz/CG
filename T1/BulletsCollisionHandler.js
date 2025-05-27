import * as THREE from 'three';
import {
    setDefaultMaterial,
} from "../libs/util/util.js";

export class Sphere {
    sphere
    direction
    move
    speed = 3;

    constructor(scene, position, camera) {
        const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 16);
        const materialSphere = setDefaultMaterial('lightblue');
        this.sphere = new THREE.Mesh(sphereGeometry, materialSphere);
        scene.add(this.sphere);

        // Define posição inicial
        this.sphere.position.copy(position);

        // Direção baseada na câmera
        const dir = new THREE.Vector3();
        this.direction = camera.getWorldDirection(dir);

        this.move = true;
    }

    update() {
        if (this.move) {
            const velocity = this.direction.clone().multiplyScalar(this.speed);
            this.sphere.position.add(velocity);    // this.sphere.translateZ(-2) fez com que a bolinha seja disparada para uma unica direção, bolinha não estava girando junto com a câmera
            console.log(this.sphere.position)
        }
    }

    remove(scene) {
        scene.remove(this.sphere);
    }
}