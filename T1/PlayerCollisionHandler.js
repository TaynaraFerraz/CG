import * as THREE from 'three';
import { degreesToRadians } from '../libs/util/util.js';
import { Vector3 } from '../build/three.module.js';

export class PlayerCollisionHandler {
    #yAxis;
    #scene;
    #player;
    #collidables = {};
    #oldPos;
    #raycaster;
    #boundingBox;

    constructor(scene, player, collidables) {
        this.#yAxis = new THREE.Vector3(0, 1, 0);
        this.#player = player;
        this.#collidables = collidables;
        this.#scene = scene;
        this.#oldPos = new THREE.Vector3();
        this.#player.getWorldPosition(this.#oldPos);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 30;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.#player);

        //this.#player.add(this.#boundingBox);
    }

    handleCollisions() {
        let currentPos = new THREE.Vector3();
        let col = 0;
        this.#boundingBox.setFromObject(this.#player);
        this.#player.getWorldPosition(currentPos);

        this.#collidables.areas.forEach((object) => {
            //console.log(box);

            if (this.#boundingBox.intersectsBox(object.box)) {

                let deltaMovement = new THREE.Vector3(0, 0, 0);

                col++;

                //console.log(box);

                if (this.#oldPos.x != currentPos.x ||
                    this.#oldPos.z != currentPos.z
                ) {
                    let invertedOldPos = new Vector3(0, 0, 0);
                    invertedOldPos.copy(this.#oldPos);
                    invertedOldPos.multiplyScalar(-1);

                    deltaMovement.addVectors(currentPos, invertedOldPos); //pegando o vetor da direção do movimento subtraindo posição antiga da nova
                    //console.log("delta", deltaMovement, currentPos, invertedOldPos);

                    let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
                    normalizedMovementDirection.copy(deltaMovement);
                    normalizedMovementDirection.normalize(); //direção normalizada

                    //console.log(normalizedMovementDirection);
                    
                    
                    this.#raycaster.set(this.#player.position, normalizedMovementDirection);

                    while(!this.#raycaster.intersectObject(object.mesh, false)){
                        normalizedMovementDirection.applyAxisAngle(yAxis, degreesToRadians(1));
                        console.log('rodando');
                        
                    }

                    let normalToIntersection = new THREE.Vector3();
                    let intersectionResult = this.#raycaster.intersectObject(object.mesh, false)[0]

                    if (intersectionResult) {
                        //console.log(intersectionResult);
                        normalToIntersection = intersectionResult.normal;
                        
                        
                        let posAfterCollision = new THREE.Vector3();
                        
                        posAfterCollision = currentPos;
                        posAfterCollision.add(deltaMovement.multiplyScalar(-1)); //tirando delta da posição
                        deltaMovement.multiplyScalar(-1); //voltando pro original
                        console.log("posAft1", posAfterCollision);

                        deltaMovement.projectOnPlane(normalToIntersection);
                        console.log("delta", deltaMovement);
                        
                        posAfterCollision.add(deltaMovement);
                        console.log("posAft", posAfterCollision);
                        
                        this.#player.position.x = posAfterCollision.x;
                        this.#player.position.y = posAfterCollision.y;
                        this.#player.position.z = posAfterCollision.z;
                        console.log("pp", this.#player.position);

                        /* var distance = 100; // at what distance to determine pointB

                        //linha para ver o raio
                        var pointB = new THREE.Vector3();
                        pointB.addVectors(this.#oldPos, normalizedMovementDirection);

                        let points = [this.#oldPos, pointB]

                        const material = new THREE.LineBasicMaterial({
                            color: 0x0110ff
                        });
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);

                        const line = new THREE.Line(geometry, material);
                        this.#scene.add(line); */
                    }
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

        //console.log(col);


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
        this.#oldPos = currentPos;
        console.log("col", col);
        
    }
}