import * as THREE from 'three';

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

        this.direction.multiplyScalar(-4); //calcular um ponto a frente a esfera, nesse caso de magnitude 4
        sphereLookAt.add(this.direction);
        this.direction.multiplyScalar(-1 / 4);// reverte para não alterar em outras partes

        sphere.lookAt(sphereLookAt);
        sphere.translateZ(-0.1); //para sair da boca do cilindro e não do meio
    }

    handleCollisionsGun(collidables, enemiesAreas) {
        this.#camera.getWorldDirection(this.direction);

        this.#spheres = this.#spheres.filter((sphere) => {
            const prevPositionBall = sphere.position.clone();

            // realiza a movimentação/translação da esfera
            this.#updateSpherePosition(sphere);

            const currPositionBall = sphere.position.clone();
            const directionBall = new THREE.Vector3().subVectors(currPositionBall, prevPositionBall).normalize(); //vetor normalizado apenas para ter a direção
            const distanceBall = prevPositionBall.distanceTo(currPositionBall);

            const allEnemies = Object.values(enemiesAreas.inimigos).flat();
            const enemyMeshes = allEnemies.map(e => e.object).filter(Boolean);

            // colidíveis que serão analisados
            const collidableMeshes = [
                ...collidables.areas.map(obj => obj.mesh),
                ...collidables.walls.map(obj => obj.mesh),
                ...enemyMeshes
            ];

            //raio para identificar objetos nessa direção
            const raycasterBall = new THREE.Raycaster(prevPositionBall, directionBall, 0, distanceBall);
            const intersectsBall = raycasterBall.intersectObjects(collidableMeshes, true);

            //verificação da altura para remover caso ultrapassar o chão e o máximo da altura
            if (intersectsBall.length > 0 || sphere.position.y >= 72 || sphere.position.y <= 0) {
                const hit = intersectsBall[0]?.object

                const enemyHit = allEnemies.find(e =>
                    e?.object === hit || e?.object?.children.includes(hit) || e?.object?.getObjectById(hit?.id) !== undefined
                );

                if (enemyHit) {
                    console.log('colidiu com inimigo')
                    console.log(enemyHit)
                    enemyHit.damage(10)
                }
                else
                    console.log('colidiu normal')
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
    // função de lidar com as colisões
    handleBulletsCollisions(collidables) {
        this.#camera.getWorldDirection(this.direction);

        this.#spheres = this.#spheres.filter((sphere) => {
            const prevPositionBall = sphere.position.clone();

            // realiza a movimentação/translação da esfera
            this.#updateSpherePosition(sphere);

            const currPositionBall = sphere.position.clone();
            const directionBall = new THREE.Vector3().subVectors(currPositionBall, prevPositionBall).normalize(); //vetor normalizado apenas para ter a direção
            const distanceBall = prevPositionBall.distanceTo(currPositionBall);

            const collidableMeshes = [
                ...collidables.areas.map(obj => obj.mesh),
                ...collidables.walls.map(obj => obj.mesh),
            ];

            //raio para identificar objetos nessa direção
            const raycasterBall = new THREE.Raycaster(prevPositionBall, directionBall, 0, distanceBall);
            const intersectsBall = raycasterBall.intersectObjects(collidableMeshes, true);

            //verificação da altura para remover caso ultrapassar o chão e o máximo da altura
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