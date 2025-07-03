import * as THREE from 'three';
import {
    setDefaultMaterial,
} from "../libs/util/util.js";

export class BulletsCollisionHandler {
    #spheres = []
    #camera;
    #scene;
    position
    direction
    move
    speed = 4.5;
    prevPosition;

    constructor(scene, camera) {
        this.#camera = camera;
        this.#scene = scene;

        // Direção baseada na câmera
        const dir = new THREE.Vector3();
        this.direction = camera.getWorldDirection(dir);

        //this.prevPosition = position.clone();
        this.move = true;
    }

    #updateSpherePosition(sphere) {
        sphere.translateZ(-this.speed);
    }

    addSphere(sphere) {
        this.#spheres.push(sphere);

        // Direção baseada na câmera
        let sphereLookAt = new THREE.Vector3();
        sphere.getWorldPosition(sphereLookAt);

        this.direction.multiplyScalar(-4);
        sphereLookAt.add(this.direction);
        this.direction.multiplyScalar(-1 / 4);

        sphere.lookAt(sphereLookAt);
        sphere.translateZ(-0.3); //para sair da boca do cilindro e não do meio
    }

    handleBulletsCollisions(collidables) {
        this.#camera.getWorldDirection(this.direction);

        this.#spheres = this.#spheres.filter((sphere) => {
            const prevPositionBall = sphere.position.clone();

            this.#updateSpherePosition(sphere);

            const currPositionBall = sphere.position.clone();
            const directionBall = new THREE.Vector3().subVectors(currPositionBall, prevPositionBall).normalize();
            const distanceBall = prevPositionBall.distanceTo(currPositionBall);

            const collidableMeshes = [
                ...collidables.areas.map(obj => obj.mesh),
                ...collidables.walls.map(obj => obj.mesh),
            ];

            const raycasterBall = new THREE.Raycaster(prevPositionBall, directionBall, 0, distanceBall);
            const intersectsBall = raycasterBall.intersectObjects(collidableMeshes, true);

            if (intersectsBall.length > 0 || sphere.position.y >= 72 || sphere.position.y <= 0) {
                this.#scene.remove(sphere);
                sphere.geometry.dispose();
                sphere.material.dispose();
                sphere = undefined;
                return false;
            }

            return true;
        })
        this.prevPosition = this.#camera.position;
    }
}