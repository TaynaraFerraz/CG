export class EnemiesHandler {
    #enemies = [];
    
    constructor() {

    }

    addEnemy(enemy) {
        this.#enemies.push(enemy);
    }

    handleEnemyMovements(){
        this.#enemies.forEach((enemy) => {
            enemy.handleMovement();
        });
    }
};