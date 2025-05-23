export class PlayerCollisionHandler {
    #players = [];
    collidables = [];

    constructor(collidables){
        this.collidables = collidables;
    }

    addPlayer(player){
        this.#players.push(player);
    }

    #handlePlayerCollisions(player){
        //let pos = player.position;
        let zDirection = player.getWorldDirection();
        //zDirection.applyAxisAngle();
    }

    handleCollisions(){
        this.#players.forEach((player)=> {
            this.#handlePlayerCollisions(player);
        })
    }
}