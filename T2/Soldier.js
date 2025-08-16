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
    indexRight = true;
    hangarLimits = {
        minX: 94,
        maxX: 203,
        minZ: -191,
        maxZ: -119
    };
    // Ações de animação
    anim = {};

    constructor(object, player, initialPosition, spriteMixer) {
        super(object, player, 30, 2, initialPosition);

        object.name = "soldier";
        object.scale.set(4, 4, 4);

        this.clock = new THREE.Clock();
        this.spriteMixer = spriteMixer;

        this.#initAnimations();

        const startStates = ["MOVE_LEFT", "MOVE_RIGHT", "MOVE_FORWARD_SHOOT", "MOVE_BACKWARD"];
        this.#setState(startStates[Math.floor(Math.random() * startStates.length)]);

        // tempos diferentes para cada soldado
        this.randomDurations = {
            side: 1.5 + Math.random() * 2,    // 1.5s ~ 3.5s
            forward: 2 + Math.random() * 2,   // 2s ~ 4s
            backward: 2 + Math.random() * 2   // 2s ~ 4s
        };
    }

    #initAnimations() {
        this.anim.idle = this.spriteMixer.Action(this.object, 100, 0, 0, 0, 0); //parado
        this.anim.walkLeft = this.spriteMixer.Action(this.object, 100, 0, 1, 5, 1); //esquerda
        this.anim.walkRight = this.spriteMixer.Action(this.object, 100, 0, 6, 5, 6); //direita
        this.anim.shoot = this.spriteMixer.Action(this.object, 100, 0, 0, 5, 0); //atira andando
        this.anim.back = this.spriteMixer.Action(this.object, 100, 0, 4, 4, 4); //atira andando
        this.anim.death = this.spriteMixer.Action(this.object, 100, 7, 0, 7, 4); // morrendo
    }

    #keepInsideHangar() {
        if (!this.hangarLimits) return;

        const pos = this.object.position;
        const { minX, maxX, minZ, maxZ } = this.hangarLimits;

        // trava posição dentro da área do hangar
        pos.x = THREE.MathUtils.clamp(pos.x, minX, maxX);
        pos.z = THREE.MathUtils.clamp(pos.z, minZ, maxZ);
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
            case "MOVE_BACKWARD":
                this.anim.back.playLoop();
                break;
            case "DYING":
                this.anim.death.playOnce();
                break;
            default:
                this.anim.idle.playLoop();
        }
    }

    #atFrontLimit() {
        if (!this.hangarLimits) return false;
        return this.object.position.z >= this.hangarLimits.maxZ - 0.1;
    }

    handle() {
        const delta = this.clock.getDelta();
        this.spriteMixer.update(delta);
        this.stateTime += delta;

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
                this.#keepInsideHangar();
                super.handleCollisions();
                if (this.stateTime > this.randomDurations.side) this.#setState("MOVE_FORWARD_SHOOT");
                break;

            case "MOVE_FORWARD_SHOOT":
                this.lookAtPlayer();
                this.object.translateZ(this.movementSpeed);
                this.#keepInsideHangar();
                super.handleCollisions();

                if (this.#atFrontLimit()) {
                    this.#setState("MOVE_BACKWARD");
                }

                if (this.stateTime > this.randomDurations.forward) {
                    if (this.indexRight) {
                        this.#setState("MOVE_RIGHT");
                    } else {
                        this.#setState("MOVE_LEFT");
                    }
                    this.indexRight = !this.indexRight;
                }
                break;

            case "MOVE_BACKWARD":
                this.lookAtPlayer();
                this.object.translateZ(-this.movementSpeed);
                this.#keepInsideHangar();

                // se já voltou por 2s → vai para lado
                if (this.stateTime > this.randomDurations.backward) {
                    // aleatório: esquerda ou direita
                    const next = Math.random() > 0.5 ? "MOVE_LEFT" : "MOVE_RIGHT";
                    this.#setState(next);
                }
                break;

            case "MOVE_RIGHT":
                this.object.translateX(this.movementSpeed);
                this.#keepInsideHangar();
                super.handleCollisions();
                if (this.stateTime > this.randomDurations.side) this.#setState("MOVE_FORWARD_SHOOT");
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
