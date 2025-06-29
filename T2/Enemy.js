export class Enemy {
    object;
    #health;
    player;
    angry = false;
    dead = false;

    constructor(object, player, health) {
        this.object = object;
        this.#health = health;
        this.player = player;
    }

    #kill() {
        //this.object
    };

    dealDamage(amount){
        this.#health-=amount;
        if(this.#health <=0){
            this.#kill();
        }
    };
}