import * as THREE from 'three';
import { degreesToRadians } from '../libs/util/util.js';
import { Vector3 } from '../build/three.module.js';

export class PlayerCollisionHandler {
    #fallingConstant = 0.5;
    #scene;
    #player;
    #collidables = {};
    #oldPos;
    #raycaster;
    #boundingBox;
    iteracoes = 0;

    constructor(scene, player, collidables) {
        this.#player = player;
        this.#collidables = collidables;
        this.#scene = scene;
        this.#oldPos = new THREE.Vector3();
        this.#player.getWorldPosition(this.#oldPos);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 4;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.#player);
    }

    #handleGroupCollisions(collidables) {
        let isAbove = false;
        let currentPos = new THREE.Vector3();
        this.#boundingBox.setFromObject(this.#player);
        this.#player.getWorldPosition(currentPos);


        collidables.forEach((object) => {
            if (this.#boundingBox.intersectsBox(object.box)) {
                let deltaMovement = new THREE.Vector3(0, 0, 0);


                if ((this.#oldPos.x != currentPos.x ||
                    this.#oldPos.y != currentPos.y ||
                    this.#oldPos.z != currentPos.z)
                ) {

                    deltaMovement.addVectors(currentPos, this.#oldPos.multiplyScalar(-1)); //pegando o vetor da direção do movimento subtraindo posição antiga da nova
                    this.#oldPos.multiplyScalar(-1) //voltando com a posição antiga pro valor original


                    let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
                    normalizedMovementDirection.copy(deltaMovement);
                    normalizedMovementDirection.normalize(); //direção normalizada


                    this.#raycaster.set(this.#player.position, normalizedMovementDirection); //apontando o raio para a direção do movimento


                    let normalToIntersection = new THREE.Vector3();
                    let intersectionResult = this.#raycaster.intersectObject(object.mesh, false)[0] // pega a interseção com o objeto mais próxima no raio


                    if (intersectionResult) { //se houver interseção
                        normalToIntersection = intersectionResult.normal.transformDirection(object.mesh.matrixWorld); //pega o vetor normal com a transformação para a normal do mundo


                        let posAfterCollision = new THREE.Vector3();

                        posAfterCollision = currentPos; //pega posição atual
                        posAfterCollision.add(deltaMovement.multiplyScalar(-1)); //tira o delta pra voltar na posição anterior à colisão
                        deltaMovement.multiplyScalar(-1); //voltando o delta pro original

                        deltaMovement.projectOnPlane(normalToIntersection); //projeta a variação no plano com a normal da malha

                        posAfterCollision.add(deltaMovement); //adiciona o movimento apenas na direção correta

                        //seta as coordenadas para o resultado
                        this.#player.position.x = posAfterCollision.x;
                        this.#player.position.y = posAfterCollision.y;
                        this.#player.position.z = posAfterCollision.z;



                        /* 
                        var distance = 100; // at what distance to determine pointB
                        
                        //linha para ver o raio
                        var pointB = new THREE.Vector3();
                        pointB.addVectors(this.#oldPos, normalToIntersection);
                        
                        let points = [this.#oldPos, pointB]
                        
                        const material = new THREE.LineBasicMaterial({
                            color: 0x0110ff
                                                });
                                                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        
                                                const line = new THREE.Line(geometry, material);
                                                this.#scene.add(line); */
                    }
                }
            }
            this.#raycaster.set(this.#player.position, new Vector3(0, -1, 0));

            if (this.#raycaster.intersectObject(object.mesh, false).length > 0) {
                isAbove = true;
            }
        })
        return isAbove;
    }

    handleCollisions() {
        if (Math.abs(this.#player.position.x) > 240 || Math.abs(this.#player.position.z) > 240) {
            this.#handleGroupCollisions(this.#collidables.walls);
        }

        let isAboveArea = this.#handleGroupCollisions(this.#collidables.areas);
        let isAboveStair = this.#handleGroupCollisions(this.#collidables.stairs);


        //queda
        if (!isAboveArea && this.#player.position.y > 2 && !isAboveStair) {
            this.#player.position.y -= this.#fallingConstant;
        }


        this.#player.getWorldPosition(this.#oldPos);
    }
}