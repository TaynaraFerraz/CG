import { SpriteMixer } from "../libs/sprites/SpriteMixer.js";
import { Enemy } from "./Enemy.js";
import * as THREE from "three";

export class Soldier extends Enemy {
    clock;
    spriteMixer;
    state = "IDLE";
    stateTime = 0;
    deathAnimationPlayed = false;

    movementSpeed = 0.05;
    minDistance = 2;
    indexRight = true;
    // Ações de animação
    anim = {};

    constructor(object, player, initialPosition, spriteMixer) {
        super(object, player, 30, 2, initialPosition);

        object.name = "soldier";
        object.scale.set(4, 4, 4);

        this.clock = new THREE.Clock();
        this.spriteMixer = spriteMixer;

        this.#initAnimations();
    }

    #initAnimations() {
        // IMPORTANTE: ajustar ranges de frames conforme seu spritesheet
        // Cada Action: (mesh, numTilesHoriz, numTilesVert, startTile, endTile, tilesDisplayDuration)
        this.anim.idle = this.spriteMixer.Action(this.object, 100, 0, 0, 0, 0);
        this.anim.walkLeft = this.spriteMixer.Action(this.object, 100, 0, 1, 5, 1);
        this.anim.walkRight = this.spriteMixer.Action(this.object, 100, 0, 6, 5, 6);
        this.anim.shoot = this.spriteMixer.Action(this.object, 100, 0, 0, 5, 0);
        this.anim.death = this.spriteMixer.Action(this.object, 100, 7, 0, 7, 4);
    }

    #setState(newState) {
        this.state = newState;
        this.stateTime = 0;

        // Para todas as animações antes de iniciar a nova
        Object.values(this.anim).forEach(a => a.stop());

        switch (newState) {
            case "MOVE_LEFT":
                this.anim.walkLeft.playLoop();
                break;
            case "MOVE_FORWARD_SHOOT":
                this.anim.shoot.playLoop();
                break;
            case "MOVE_RIGHT":
                this.anim.walkRight.playLoop();
                break;
            case "DYING":
                this.anim.death.playOnce();
                break;
            default:
                this.anim.idle.playLoop();
        }
    }

    handle() {
        const delta = this.clock.getDelta();
        this.spriteMixer.update(delta);
        this.stateTime += delta;
        
        super.handleCollisions();
        if (this.dying) {
            if (!this.deathAnimationPlayed) {
                this.#setState("DYING");
                this.deathAnimationPlayed = true;
                this.deathElapsed = 0;
            }
            this.deathElapsed += delta;
            const deathDuration = (this.anim.death.indexEnd - this.anim.death.indexStart + 1) *
                this.anim.death.tileDisplayDuration / 1000;
            if (this.deathElapsed >= deathDuration) {
                this.object.setFrame(7, 4);
                super.handleHealth();
            }
            return;
        }

        // FSM de movimento
        switch (this.state) {
            case "IDLE":
                this.#setState("MOVE_LEFT");
                break;

            case "MOVE_LEFT":
                this.object.translateX(-this.movementSpeed);
                super.handleCollisions();
                if (this.stateTime > 2) this.#setState("MOVE_FORWARD_SHOOT");
                break;

            case "MOVE_FORWARD_SHOOT":
                this.lookAtPlayer();
                this.object.translateZ(this.movementSpeed);
                super.handleCollisions();
                if (this.stateTime > 3) {
                    if (this.indexRight) {
                        this.#setState("MOVE_RIGHT");
                    } else {
                        this.#setState("MOVE_LEFT");
                    }
                    this.indexRight = !this.indexRight;
                }
                break;

            case "MOVE_RIGHT":
                this.object.translateX(this.movementSpeed);
                super.handleCollisions();
                if (this.stateTime > 2) this.#setState("MOVE_FORWARD_SHOOT");
                break;
        }

        super.handleHealth();
    }

    lookAtPlayer() {
        const dir = new THREE.Vector3().subVectors(this.player.position, this.object.position);
        dir.y = 0; // mantém no plano horizontal
        if (dir.length() > 0.001) {
            dir.normalize();
            this.object.rotation.y = Math.atan2(dir.x, dir.z);
        }
    }
}
