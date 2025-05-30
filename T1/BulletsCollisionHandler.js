import * as THREE from 'three';
import {
    setDefaultMaterial,
} from "../libs/util/util.js";
import { Vector3 } from '../build/three.module.js';

export const spheres = []
export class BulletsCollisionHandler {
    #spheres = []
    #camera;
    #scene;
    position
    direction
    move
    speed = 0.5;
    prevPosition
    // #spheres = [];

    constructor(scene, camera) {
        const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 16);
        const materialSphere = setDefaultMaterial('lightblue');
        this.sphere = new THREE.Mesh(sphereGeometry, materialSphere);
        spheres.push(this) // instancia ou inves de armazenar a mesh
        scene.add(this.sphere);
        console.log(spheres.length)
        this.#camera = camera;
        this.#scene = scene;

        // Define posição inicial
        //this.sphere.position.copy(position);

        // Direção baseada na câmera
        const dir = new THREE.Vector3();
        this.direction = camera.getWorldDirection(dir);

        //this.prevPosition = position.clone();
        this.move = true;
    }

    #updateSpherePosition(sphere) {
            sphere.translateZ(-this.speed);
            /* this.prevPosition.copy(this.sphere.position);
            const velocity = this.direction.clone().multiplyScalar(this.speed);
            this.sphere.position.add(velocity);    // this.sphere.translateZ(-2) fez com que a bolinha seja disparada para uma unica direção, bolinha não estava girando junto com a câmera
            console.log(this.sphere.position); */
    }

    remove(scene) {
        scene.remove(this.sphere);
    }

    addSphere(sphere) {
        this.#spheres.push(sphere);

        // Direção baseada na câmera
        let sphereLookAt = new THREE.Vector3();
        sphere.getWorldPosition(sphereLookAt);

        console.log("pos atual", sphereLookAt);
        console.log("direcao", this.direction);
        this.direction.multiplyScalar(-4);
        sphereLookAt.add(this.direction);
        this.direction.multiplyScalar(-1/4);

        console.log("final", sphereLookAt);

        sphere.lookAt(sphereLookAt);
    }

    handleBulletsCollisions(collidables) {
        this.#camera.getWorldDirection(this.direction);
        //console.log(this.direction);
        
        this.#spheres = this.#spheres.filter((s) => {
            //console.log(s);
            
            const prevPositionBall = s.position.clone();

            this.#updateSpherePosition(s);

            const currPositionBall = s.position.clone();
            const directionBall = new THREE.Vector3().subVectors(currPositionBall, prevPositionBall).normalize();
            const distanceBall = prevPositionBall.distanceTo(currPositionBall);

            const collidableMeshes = [
                ...collidables.areas.map(obj => obj.mesh),
                ...collidables.walls.map(obj => obj.mesh),
            ];

            const raycasterBall = new THREE.Raycaster(prevPositionBall, directionBall, 0, distanceBall);
            const intersectsBall = raycasterBall.intersectObjects(collidableMeshes, true);

            if (intersectsBall.length > 0 || s.position.y >= 72 || s.position.y <= 0) {
                console.log("colidiu")
                console.log('position', s.position)
                this.#scene.remove(s);
                s.geometry.dispose();
                s.material.dispose();
                s = undefined;
                return false;
            }
            console.log(this.#spheres.length)
            
            return true;
        })
        //console.log(this.#spheres.length)
        this.prevPosition = this.#camera.position;
    }
}