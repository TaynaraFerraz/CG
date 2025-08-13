import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import { Enemy } from "./Enemy.js";
import * as THREE from 'three';

export class Soldier extends Enemy {
    isMoving;
    clock;
    spriteMixer;
    minDistance;
    runDownAction;
    dead;

    constructor(object, player, initialPosition, spriteMixer) {
        super(object, player, 20, 2, initialPosition);
        object.name = "soldier";
        this.object.scale.set(4, 4, 4);

        this.clock = new THREE.Clock();

        this.spriteMixer = spriteMixer;
        this.movementSpeed = 0.1;
        this.minDistance = 1.5;
        this.dead = false;
        this.isMoving = false;

        this.initializeBasicAnimations();
    }

    initializeBasicAnimations() {
        this.runDownAction = this.spriteMixer.Action(this.object, 100, 0, 0, 3, 0);

        //this.runDownAction.stop();
    }

    handle() {
        if (this.dead) return;

        const delta = this.clock.getDelta();

        this.spriteMixer.update(delta);

        super.handleCollisions();
        super.handleHealth();

        this.lookAtPlayer();

        this.moveTowardsPlayer();
    }

    lookAtPlayer() {
        const direction = new THREE.Vector3().subVectors(
            this.player.position,
            this.object.position
        );
        direction.y = 0;
        if (direction.length() > 0.001) {
            direction.normalize();
            this.object.rotation.y = Math.atan2(direction.x, direction.z);
        }
    }

    moveTowardsPlayer() {
        const direction = new THREE.Vector3().subVectors(
            this.player.position,
            this.object.position
        );
        const distance = direction.length();

        if (distance > this.minDistance) {
            direction.normalize();

            this.object.position.addScaledVector(direction, this.movementSpeed);

            if (!this.isMoving) {   
                this.isMoving = true;
                this.runDownAction.playLoop(); // inicia animação
            }
        } else {
            if (this.isMoving) {
                this.isMoving = false;
                this.runDownAction.stop(); // para animação quando parar
            }
        }
    }
}
