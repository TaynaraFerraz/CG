import * as THREE from 'three';
import { degreesToRadians } from '../libs/util/util.js';

export class PlayerCollisionHandler {
    #scene;
    #player;
    #collidables = [];
    #pos;
    #raycaster;
    #boundingBox;

    constructor(scene, player, collidables) {
        this.#player = player;
        this.#collidables = collidables;
        this.#scene = scene;
        this.#pos = new THREE.Vector3(0, 0, 0);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 10;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.#player);

        this.#player.add(this.#boundingBox);
    }

    addPlayer(player) {
        this.#player.push(player);
    }

    handleCollisions() {
        const yAxis = new THREE.Vector3(0, 1, 0);
        let currentPos = player.position;
        let movementDirection = new THREE.Vector3(0, 0, 0);
        movementDirection.addVectors(currentPos, this.#pos.multiplyScalar(-1)); //pegando o vetor da direção do movimento subtraindo posição antiga da nova

        let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
        normalizedMovementDirection.copy(movementDirection);
        normalizedMovementDirection.normalize(); //direção normalizada



        this.#raycaster.set(this.#player.position, normalizedMovementDirection);
        


        /* let direction = new THREE.Vector3(0, 0, 0)
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