import * as THREE from 'three';
import { Vector3 } from '../build/three.module.js';
import { PLAYER_HEIGHT } from './constants.js';

export class PlayerCollisionHandler {
    #fallingConstant = 0.5;
    #scene;
    #player;
    #collidables = {};
    #oldPos;
    #raycaster;
    #raycasterOrigin;
    #boundingBox;
    iteracoes = 0;

    constructor(scene, player, collidables) {
        this.#player = player;
        this.#collidables = collidables;
        this.#scene = scene;
        this.#oldPos = new THREE.Vector3();
        this.#player.getWorldPosition(this.#oldPos);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 20;
        this.#raycasterOrigin = new Vector3();

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.#player);
    }

    #handleGroupCollisions(collidables, isStairs, log) {
        let isAbove = false;
        let currentPos = new THREE.Vector3();
        this.#boundingBox.setFromObject(this.#player);
        this.#player.getWorldPosition(currentPos);

        let deltaMovement = new THREE.Vector3(0, 0, 0);
        
        
        collidables.forEach((object) => {
            if (this.#boundingBox.intersectsBox(object.box)) {
                
                
                if ((this.#oldPos.x != currentPos.x ||
                    this.#oldPos.y != currentPos.y ||
                    this.#oldPos.z != currentPos.z) //se tiver variação de posição
                ) {

                    deltaMovement.addVectors(currentPos, this.#oldPos.multiplyScalar(-1)); //pegando o vetor da direção do movimento subtraindo posição antiga da nova
                    this.#oldPos.multiplyScalar(-1) //voltando com a posição antiga pro valor original

                    
                    let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
                    normalizedMovementDirection.copy(deltaMovement);
                    normalizedMovementDirection.normalize(); //direção normalizada

                    this.#raycaster.set(this.#player.position, normalizedMovementDirection); //apontando o raio para a direção do movimento
                    
                    if(isStairs){
                        this.#raycaster.set(this.#player.position, new Vector3(0, -1, 0));
                    }
                    
                    
                    let normalToIntersection = new THREE.Vector3();
                    let intersectionResult = this.#raycaster.intersectObject(object.mesh, false)[0] // pega a interseção com o objeto mais próxima no raio
                    
                    
                    if (intersectionResult) { //se houver interseção
                        normalToIntersection = intersectionResult.normal.transformDirection(object.mesh.matrixWorld); //pega o vetor normal com a transformação para a normal do mundo
                        //console.log(log, normalToIntersection);
                        
                        
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
                    } else if(isStairs) {
                        this.#player.position.y+=(this.#fallingConstant); //caso caia embaixo da escada, espero que nunca mais rode
                    }
                }
            }

            let isAboveTestPosition = new Vector3();
            isAboveTestPosition.copy(this.#player.position);
            deltaMovement.normalize();

            if(isStairs){
                //isAboveTestPosition.add(deltaMovement.multiplyScalar(3));
            }

            this.#raycaster.set(isAboveTestPosition, new Vector3(0, -1, 0));

            let isAboveCheckingRay = this.#raycaster.intersectObject(object.mesh, false);
            if (isAboveCheckingRay.length > 0) {
                console.log(isAboveCheckingRay[0].distance);
                
                if(isAboveCheckingRay[0].distance<PLAYER_HEIGHT/2+1) {
                    console.log(isAbove);
                    isAbove = true;
                }
            }
        })
        return isAbove;
    }

    handleCollisions() {
        if (Math.abs(this.#player.position.x) > 240 || Math.abs(this.#player.position.z) > 240) {
            this.#handleGroupCollisions(this.#collidables.walls);
        }

        let isAboveArea = this.#handleGroupCollisions(this.#collidables.areas, false, "colidiu");
        let isAboveStair = this.#handleGroupCollisions(this.#collidables.stairs, true);


        //queda
        if (this.#player.position.y > PLAYER_HEIGHT/2 && !isAboveArea && !isAboveStair) {
            this.#player.position.y -= this.#fallingConstant;
            console.log("caindo");
        }

        this.#player.getWorldPosition(this.#oldPos);
    }
}



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