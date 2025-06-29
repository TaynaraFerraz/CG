import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class Cacodemon extends Enemy {
    constructor(object, player) {
        super(object, player, 20);
    }

    handleMovement() {
        
        if(!this.angry){
            let enemyLookAt = new THREE.Vector3();
            enemyLookAt = this.player.getWorldPosition(enemyLookAt);
            this.object.lookAt(enemyLookAt);
            this.object.translateZ(0.3);
        }
    }

};
