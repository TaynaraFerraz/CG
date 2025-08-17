import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_WIDTH, SHIFT_MULTIPLIER, SPEED } from './constants.js';
import { Collidables } from './Collidables.js';
import { Area } from './createArea.js';
import { desertArea } from './Area4.js';

export class PlayerCollisionHandler {
    #fallingSpeed = 0.7;
    #player;
    #playerObject;
    #originalCollidables = {};
    #currentCollidables = {};
    #oldPos;
    #raycaster;
    #boundingBox;
    #usefulCollisionAreaBox;
    #isFiltering;
    #usefulBoxCheckingDelaySeconds = 2;
    #movimentoCompleto = true;
    #isUp = true;
    #playerClass;
    #lastDamageTime = 0;
    #damageCooldown = 500;

    constructor(player, playerClass) {
        this.#playerObject = player.object;
        this.#playerClass = playerClass;
        this.#player = player;
        this.#originalCollidables = Collidables.collidables;
        this.#currentCollidables = { ...Collidables.collidables };

        this.#oldPos = new THREE.Vector3();
        this.#playerObject.getWorldPosition(this.#oldPos);
        this.#raycaster = new THREE.Raycaster();
        this.#raycaster.far = 20;

        this.#boundingBox = new THREE.Box3();
        this.#boundingBox.setFromObject(this.#playerObject);

        this.#usefulCollisionAreaBox = new THREE.Box3();
        this.#isFiltering = false;

        setInterval(() => this.#isFiltering = true, this.#usefulBoxCheckingDelaySeconds * 1000); //filtra nessa cadência
    }

    #isAbove(object) {
        let isAbove = false;
        let isAboveTestPosition = new THREE.Vector3();
        isAboveTestPosition.copy(this.#playerObject.position);
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
        this.#boundingBox.setFromObject(this.#playerObject);
        this.#playerObject.getWorldPosition(currentPos);

        //apenas para quando for filtrar
        //cria uma box com a maior distância que o jogador consegue percorrer no intervalo estipulado
        const min = new THREE.Vector3(this.#playerObject.position.x - SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds, 0, this.#playerObject.position.z - SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds);
        const max = new THREE.Vector3(this.#playerObject.position.x + SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds, 40, this.#playerObject.position.z + SPEED * SHIFT_MULTIPLIER * this.#usefulBoxCheckingDelaySeconds);
        this.#usefulCollisionAreaBox.set(min, max);

        filteredCollidables = filteredCollidables.filter((object) => {
            if (this.#boundingBox.intersectsBox(object.box)) {
                if ((this.#oldPos.x != currentPos.x ||
                    this.#oldPos.y != currentPos.y ||
                    this.#oldPos.z != currentPos.z) //se tiver variação de posição do player
                ) {

                    deltaMovement.copy(currentPos);
                    deltaMovement.addScaledVector(this.#oldPos, -1); //pegando o vetor da direção do movimento subtraindo posição antiga da nova


                    let normalizedMovementDirection = new THREE.Vector3(0, 0, 0);
                    normalizedMovementDirection.copy(deltaMovement);
                    normalizedMovementDirection.normalize(); //direção normalizada

                    this.#raycaster.set(this.#oldPos, normalizedMovementDirection); //apontando o raio para a direção do movimento

                    if (isStair) {
                        this.#raycaster.set(this.#oldPos, new THREE.Vector3(0, -1, 0)); //se for uma escada, solta o raio pra baixo ao invés da direção de movimento
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
                        this.#playerObject.position.copy(posAfterCollision);
                    } else if (isStair) {
                        this.#playerObject.position.y += (this.#fallingSpeed); //caso caia embaixo da escada, espero que nunca mais rode
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

    gravity(status) {
        if(status)
            this.#fallingSpeed = 0.7;
        if(!status)
            this.#fallingSpeed = 0.0;
    }
    
    handleCollisions() {
        //testando paredes
        this.#handleGroupCollisions(this.#currentCollidables.walls, "walls");
        
        //vendo se está em cima de áreas ou escadas
        let isAboveArea = this.#handleGroupCollisions(this.#currentCollidables.areas, "areas");
        let isAboveStair = this.#handleGroupCollisions(this.#currentCollidables.stairs, "stairs", true);

        // --- DANO DE CACTO ---
        // Atualiza bounding box do player
        this.#boundingBox.setFromObject(this.#player);

        // Percorre todos os cactos e verifica colisão
        const now = performance.now();
        for (let c of desertArea.cactus) {
            if (c.box && this.#boundingBox.intersectsBox(c.box)) {
                
                if (now - this.#lastDamageTime >= this.#damageCooldown) {
                console.log("cacto");
                this.#playerClass.damage(5);
                this.#lastDamageTime = now;
                }
            }
        }

        this.#isFiltering = false; //para de filtrar

        //vendo se pode cair
        if (this.#playerObject.position.y > PLAYER_HEIGHT / 2 && !isAboveArea && !isAboveStair && !this.isElevador(this.#playerObject)) {
            this.#playerObject.position.y -= this.#fallingSpeed;
        }
        //correção caso entre no chão
        if(this.#player.position.y < PLAYER_HEIGHT /2)
            this.#player.position.y = PLAYER_HEIGHT /2;

        if (!this.#movimentoCompleto || this.elevadorNear(this.#playerObject)) {
            if (Area.isDown && (this.isElevador() || !this.#movimentoCompleto)) {
                this.#movimentoCompleto = this.elevadorUp(this.#playerObject);
            }else if (!Area.isDown && this.#isUp) {
                this.#movimentoCompleto = this.elevadorDown(this.#playerObject);
            }
        }
        if(!this.elevadorNear() && !this.#isUp && !Area.isDown && this.#movimentoCompleto){
            this.#isUp = true;
        }
        this.#playerObject.getWorldPosition(this.#oldPos);
    }

    elevadorUp() {
    let elevadorObj = Area.elevador[0];
    let elevador = elevadorObj.mesh;
    const velocidade = 0.08;
    const targetY = 0.0;

    if (this.isElevador(this.#playerObject) || this.#boundingBox.intersectsBox(Area.elevadorCheck)) {
        // Move elevador para cima
        if (elevador.position.y + velocidade < targetY) {
            elevador.position.y += velocidade;
        } else {
            elevador.position.y = targetY;
        }
        // Sempre coloca o player em cima do elevador
        let elevadorWorldY = new THREE.Vector3();
        elevador.getWorldPosition(elevadorWorldY);
        if(elevadorWorldY.y >= -3.0)
        this.#playerObject.position.y = elevadorWorldY.y + PLAYER_HEIGHT / 2 + 3;
    } else {
        // Só o elevador sobe
        if (elevador.position.y + velocidade < targetY) {
            elevador.position.y += velocidade;
        } else {
            elevador.position.y = targetY;
        }
    }

    // Atualiza a Box3 do elevador
    elevadorObj.box.setFromObject(elevador, true);

    let elevadorCollidable = Area.collidableAreas.find(obj => obj.mesh === elevador);
    if (elevadorCollidable) {
        elevadorCollidable.box.setFromObject(elevador, true);
    }

    // Checa se chegou ao topo
    if (elevador.position.y >= targetY) {
        elevador.position.y = targetY;
        Area.isDown = false;
        this.#isUp = false;
        return true;
    }
    return false;
}

  elevadorDown() {
    let elevadorObj = Area.elevador[0];
    let elevador = elevadorObj.mesh;
    const velocidade = 0.08; // ajuste conforme desejado
    const targetY = -6.1;

    if (this.isElevador(this.#playerObject) && this.#playerObject.position.y > PLAYER_HEIGHT / 2) {
        // Move elevador e player juntos para baixo
        if (elevador.position.y - velocidade > targetY) {
            elevador.position.y -= velocidade;
            this.#playerObject.position.y -= velocidade;
        } else {
            elevador.position.y = targetY;
            this.#playerObject.position.y = PLAYER_HEIGHT / 2;
        }
    } else {
        // Só o elevador desce
        if (elevador.position.y - velocidade > targetY) {
            elevador.position.y -= velocidade;
        } else {
            elevador.position.y = targetY;
        }
    }

    elevadorObj.box.setFromObject(elevador, true);

    let elevadorCollidable = Area.collidableAreas.find(obj => obj.mesh === elevador);
    if (elevadorCollidable) {
        elevadorCollidable.box.setFromObject(elevador, true);
    }
    if (elevador.position.y <= targetY) {
        elevador.position.y = targetY;
        Area.isDown = true;
        return true;
    }
    return false;
}

  elevadorNear() {
    this.#boundingBox.setFromObject(this.#playerObject);
    return this.#boundingBox.intersectsBox(Area.elevadorCheck);
  }

  isElevador() {
    let elevadorMesh = Area.elevador[0].mesh;

    let origin = this.#playerObject.position.clone();
    let direction = new THREE.Vector3(0, -1, 0);

    let raycaster = new THREE.Raycaster(origin, direction, 0, 10);

    let intersects = raycaster.intersectObject(elevadorMesh, true);

    if (intersects.length > 0 && intersects[0].distance < PLAYER_HEIGHT / 2 + 0.5) {
        return true;
    }
    return false;
  }
}