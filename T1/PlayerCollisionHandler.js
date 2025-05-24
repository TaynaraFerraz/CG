import * as THREE from 'three';
import { degreesToRadians } from '../libs/util/util.js';
import { Vector3 } from '../build/three.module.js';

export class PlayerCollisionHandler {
    #scene;
    #player;
    #collidables = [];
    #oldPos;
    #raycaster;
    #boundingBox;

    constructor(scene, player, collidables) {
        this.#player = player;
        this.#collidables = collidables;
        this.#scene = scene;
        this.#oldPos = new THREE.Vector3();
        this.#player.getWorldPosition(this.#oldPos);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 10;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(player);

        //this.#player.add(this.#boundingBox);
    }

    handleCollisions() {
        let currentPos = new THREE.Vector3();

        this.#collidables.forEach((sceneChild) => {
            //console.log(sceneChild.isObject3D);

            if (this.#boundingBox.intersectsBox(sceneChild)) {
                this.#player.getWorldPosition(currentPos);

                let movementDirection = new THREE.Vector3(0, 0, 0);

                //console.log(sceneChild);
                
                if (this.#oldPos.x != currentPos.x &&
                    this.#oldPos.z != currentPos.z &&
                    sceneChild.min != this.#boundingBox.min
                ) {
                    let invertedOldPos = new Vector3();
                    invertedOldPos.copy(this.#oldPos);
                    invertedOldPos.multiplyScalar(-1);

                    movementDirection.addVectors(currentPos, invertedOldPos); //pegando o vetor da direção do movimento subtraindo posição antiga da nova

                    let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
                    normalizedMovementDirection.copy(movementDirection);
                    normalizedMovementDirection.normalize(); //direção normalizada

                    console.log(normalizedMovementDirection);


                    this.#raycaster.set(this.#player.position, normalizedMovementDirection);

                    let ray = new THREE.Ray(this.#oldPos, normalizedMovementDirection);

                    var distance = 100; // at what distance to determine pointB

                    //linha para ver o raio
                    var pointB = new THREE.Vector3();
                    pointB.addVectors(this.#oldPos, normalizedMovementDirection.multiplyScalar(distance));

                    let points = [this.#oldPos, pointB]

                    const material = new THREE.LineBasicMaterial({
                        color: 0x0110ff
                    });
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);

                    const line = new THREE.Line(geometry, material);
                    this.#scene.add(line);
                }




                /* this.#raycaster.set(this.#player.position, normalizedMovementDirection);

                this.#player.getWorldDirection(normalizedMovementDirection);

                let ray = new THREE.Ray(this.#oldPos, normalizedMovementDirection);

                var distance = 100; // at what distance to determine pointB

                //linha para ver o raio
                var pointB = new THREE.Vector3();
                pointB.addVectors(this.#oldPos, normalizedMovementDirection.multiplyScalar(distance));

                let points = [this.#oldPos, pointB]

                const material = new THREE.LineBasicMaterial({
                    color: 0x0110ff
                });
                const geometry = new THREE.BufferGeometry().setFromPoints(points);

                const line = new THREE.Line(geometry, material);
                this.#scene.add(line); */
            }
        })

        this.#oldPos = currentPos;


        /* if (moveForward) {
        cameraHolder.translateZ(-speed * delta);
    }
    else if (moveBackward) {
        cameraHolder.translateZ(speed * delta);
    }

    if (moveRight) {
        cameraHolder.translateX(speed * delta);
    }
    else if (moveLeft) {
        cameraHolder.translateX(speed * -1 * delta);
    } */

        /* let normalizedMovementDirection = new THREE.Vector3(0, 0, 0)
        player.getWorldDirection(direction);

        direction.applyAxisAngle(yAxis, degreesToRadians(45));

        let ray = new THREE.Ray(pos, direction);

        var distance = 100; // at what distance to determine pointB

        //linha para ver o raio
        var pointB = new THREE.Vector3();
        pointB.addVectors(pos, direction.multiplyScalar(distance));

        let points = [pos, pointB]

        const material = new THREE.LineBasicMaterial({
            color: 0x0110ff
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material);
        this.#scene.add(line); */
    }
}