import * as THREE from 'three';
import { Collidables } from './Collidables.js';
import { scene } from './camera.js';
import { HealthBar } from './HealthBar.js';

export class Enemy {
    object;
    boundingBox;
    player;
    #health;
    #minHeight;
    #maxHealth;
    angry = true;
    dead = false;
    #oldPos;
    #boundingBox;
    #raycaster;
    lookAtQuaternion;
    #healthBar

    constructor(object, player, maxHealth, minHeight = 4) {
        this.object = object;
        this.#maxHealth = maxHealth;
        this.#health = maxHealth;
        this.player = player;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(object);
        
        this.#minHeight = minHeight;

        this.#oldPos = new THREE.Vector3();
        this.object.getWorldPosition(this.#oldPos);

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.object);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 5;

        this.lookAtQuaternion = new THREE.Quaternion();

        this.#healthBar = new HealthBar(this, 3, 0.7);
    }

    #kill() {
        //this.object
    };

    randomizeQuaternion() {
        const randomAngle = Math.random() * Math.PI * 2
        this.lookAtQuaternion.setFromAxisAngle(this.object.up, randomAngle);
    }

    rotateTowardsQuaternion(alpha = 0.025) {
        this.object.quaternion.rotateTowards(this.lookAtQuaternion, alpha);
    }

    lookAtPlayer(alpha = 0.035) {
        let playerPosition = new THREE.Vector3();
        let lookAtMatrix = new THREE.Matrix4();

        playerPosition = this.player.getWorldPosition(playerPosition);
        lookAtMatrix.lookAt(playerPosition, this.object.position, this.object.up);
        this.lookAtQuaternion.setFromRotationMatrix(lookAtMatrix);

        this.rotateTowardsQuaternion(alpha);
    };

    damage(amount) {
        this.#health -= amount;
        if (this.#health <= 0) {
            this.#kill();
        }
    };

    handleCollisions() {
        //console.log(this.#minHeight);
        
        let currentPos = new THREE.Vector3();
        let deltaMovement = new THREE.Vector3();
        this.object.getWorldPosition(currentPos);

        deltaMovement.copy(currentPos);
        deltaMovement.addScaledVector(this.#oldPos, -1); //pegando o vetor da direção do movimento subtraindo posição antiga da nova

        this.boundingBox.setFromObject(this.object);

        for (let key in Collidables.collidables) {
            Collidables.collidables[key].forEach((collidable) => {
                if (this.#boundingBox.intersectsBox(collidable.box)) {
                    let direction = new THREE.Vector3();
                    this.object.getWorldDirection(direction);
                    this.#raycaster.set(this.object.position, direction);

                    let normalToIntersection = new THREE.Vector3();
                    let intersectionResult = this.#raycaster.intersectObject(collidable.mesh, false)[0] // pega a interseção com o objeto mais próxima no raio


                    if (intersectionResult) { //se houver interseção
                        normalToIntersection = intersectionResult.normal.transformDirection(collidable.mesh.matrixWorld); //pega o vetor normal com a transformação para a normal do mundo

                        let posAfterCollision = new THREE.Vector3();

                        posAfterCollision = currentPos; //pega posição atual
                        posAfterCollision.addScaledVector(deltaMovement, -1); //tira o delta pra voltar na posição anterior à colisão

                        deltaMovement.projectOnPlane(normalToIntersection); //projeta a variação no plano com a normal da malha

                        posAfterCollision.add(deltaMovement); //adiciona o movimento apenas na direção correta

                        //seta as coordenadas para o resultado
                        this.object.position.copy(posAfterCollision);
                    }
                }

                this.#raycaster.set(this.object.position, new THREE.Vector3(0, -1, 0));
                let intersectionResult = this.#raycaster.intersectObject(collidable.mesh, false)[0] // pega a interseção com o objeto mais próxima no raio

                if ((intersectionResult && intersectionResult.distance < this.#minHeight) || this.object.position.y < this.#minHeight) {
                    this.object.position.y += 0.02;
                }
            });

        }

        this.object.getWorldPosition(this.#oldPos);
    };

    handleHealthBar(){
        this.#healthBar.update(this.#health, this.#maxHealth);
        //this.#health -= 0.005;
    };
}