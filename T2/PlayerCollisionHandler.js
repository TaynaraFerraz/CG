import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { Collidables } from './Collidables.js';

export class PlayerCollisionHandler {
    #fallingSpeed = 0.7;
    #player;
    #originalCollidables = {};
    #currentCollidables = {};
    #oldPos;
    #raycaster;
    #boundingBox;
    #usefulCollisionAreaBox;
    #usefulBoxCheckingDelaySeconds = 1;
    #isFiltering;

    constructor(player) {
        this.#player = player;
        this.#originalCollidables = Collidables.collidables;
        this.#currentCollidables = { ...Collidables.collidables };

        this.#oldPos = new THREE.Vector3();
        this.#player.getWorldPosition(this.#oldPos);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 20;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.#player);

        this.#usefulCollisionAreaBox = new THREE.Box3();
        this.#isFiltering = false;

        setInterval(() => this.#isFiltering = true, this.#usefulBoxCheckingDelaySeconds * 1000); //filtra nessa cadência
    }

    #isAbove(object) {
        let isAbove = false;
        let isAboveTestPosition = new THREE.Vector3();
        isAboveTestPosition.copy(this.#player.position);
        let yAxis = new THREE.Vector3(0, 1, 0);
        let testDelta = new THREE.Vector3(0, 0, PLAYER_WIDTH / 2); //vetor para somar na posição e testar as quatro bordas

        for (let i = 0; i < 4; i++) {
            isAboveTestPosition.add(testDelta.applyAxisAngle(yAxis, Math.PI / 2)); //adicionando o vetor com 90 graus de rotação em y na posição do teste
            this.#raycaster.set(isAboveTestPosition, new THREE.Vector3(0, -1, 0)); //setando raio para baixo

            let isAboveCheck = this.#raycaster.intersectObject(object.mesh, false); //se intercepta, está em cima
            if (isAboveCheck.length > 0) {
                if (isAboveCheck[0].distance < PLAYER_HEIGHT / 2 + 1) {
                    isAbove = true;
                    break;
                }
            }
            isAboveTestPosition.add(testDelta.multiplyScalar(-1)); //tirando o delta da posição para os novos testes
            testDelta.multiplyScalar(-1); //voltando delta ao anterior
        }
        return isAbove;
    }

    #handleGroupCollisions(collidables, key = "", isStair = false) { //lidando com a colisão de um grupo de colidíveis, isStair serve para mudar certas coisas caso seja um conjunto de escadas
        let isAbove = false; //para retornar se está em cima de alguém do grupo de colidíveis, útil para a gravidade
        let deltaMovement = new THREE.Vector3(0, 0, 0);
        let currentPos = new THREE.Vector3();
        let filteredCollidables = this.#isFiltering ? this.#originalCollidables[key] : collidables; //se tiver que filtrar pega o original
        this.#boundingBox.setFromObject(this.#player);
        this.#player.getWorldPosition(currentPos);

        //apenas para quando for filtrar
        //cria uma box com a maior distância que o jogador consegue percorrer no intervalo estipulado
        const min = new THREE.Vector3(this.#player.position.x - SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds, 0, this.#player.position.z - SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds);
        const max = new THREE.Vector3(this.#player.position.x + SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds, 40, this.#player.position.z + SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds);
        this.#usefulCollisionAreaBox.set(min, max);

        filteredCollidables = filteredCollidables.filter((object) => {
            if (this.#boundingBox.intersectsBox(object.box)) {
                if (Math.abs(this.#player.position.x) > 249 || Math.abs(this.#player.position.z) > 249) {
                    this.#player.position.copy(this.#oldPos);
                    return;
                }

                if ((this.#oldPos.x != currentPos.x ||
                    this.#oldPos.y != currentPos.y ||
                    this.#oldPos.z != currentPos.z) //se tiver variação de posição do player
                ) {

                    deltaMovement.copy(currentPos);
                    deltaMovement.addScaledVector(this.#oldPos, -1); //pegando o vetor da direção do movimento subtraindo posição antiga da nova


                    let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
                    normalizedMovementDirection.copy(deltaMovement);
                    normalizedMovementDirection.normalize(); //direção normalizada

                    this.#raycaster.set(this.#player.position, normalizedMovementDirection); //apontando o raio para a direção do movimento

                    if (isStair) {
                        this.#raycaster.set(this.#player.position, new THREE.Vector3(0, -1, 0)); //se for uma escada, solta o raio pra baixo ao invés da direção de movimento
                    }


                    let normalToIntersection = new THREE.Vector3();
                    let intersectionResult = this.#raycaster.intersectObject(object.mesh, false)[0] // pega a interseção com o objeto mais próxima no raio


                    if (intersectionResult) { //se houver interseção
                        normalToIntersection = intersectionResult.normal.transformDirection(object.mesh.matrixWorld); //pega o vetor normal com a transformação para a normal do mundo

                        let posAfterCollision = new THREE.Vector3();

                        posAfterCollision = currentPos; //pega posição atual
                        posAfterCollision.addScaledVector(deltaMovement, -1); //tira o delta pra voltar na posição anterior à colisão

                        deltaMovement.projectOnPlane(normalToIntersection); //projeta a variação no plano com a normal da malha

                        posAfterCollision.add(deltaMovement); //adiciona o movimento apenas na direção correta

                        //seta as coordenadas para o resultado
                        this.#player.position.copy(posAfterCollision);
                    } else if (isStair) {
                        this.#player.position.y += (this.#fallingSpeed); //caso caia embaixo da escada, espero que nunca mais rode
                    }
                }
            }
            
            //conferindo as quatro bordas do player para ver se pode cair ou não
            isAbove = this.#isAbove(object) || isAbove;

            if (this.#isFiltering) {//apenas se estiver filtrando faz esse teste 
                if (this.#usefulCollisionAreaBox.intersectsBox(object.box)) return true; //se está na caixa útil passa pelo filtro
            }
        })

        if (this.#isFiltering) {//se filtrou nessa iteração
            this.#currentCollidables[key] = filteredCollidables; //seta os atuais na chave correta para os colidíveis novos
        }
        return isAbove;
    }
    
    handleCollisions() {
        //testando paredes
        this.#handleGroupCollisions(this.#currentCollidables.walls, "walls");
        
        //vendo se está em cima de áreas ou escadas
        let isAboveArea = this.#handleGroupCollisions(this.#currentCollidables.areas, "areas");
        let isAboveStair = this.#handleGroupCollisions(this.#currentCollidables.stairs, "stairs", true);

        this.#isFiltering = false; //para de filtrar

        //vendo se pode cair
        if (this.#player.position.y > PLAYER_HEIGHT / 2 && !isAboveArea && !isAboveStair) {
            this.#player.position.y -= this.#fallingSpeed;
        }
        
        this.#player.getWorldPosition(this.#oldPos);
    }
}