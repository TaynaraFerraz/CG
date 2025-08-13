import * as THREE from 'three';
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { getMaxSize } from "../libs/util/util.js";
import { Cacodemon } from "./Cacodemon.js";
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { LostSoul } from './LostSoul.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import { scene } from './camera.js';
import { SpriteMixer } from '../libs/sprites/SpriteMixer.js';
import { Soldier } from './Soldier.js';

export class EnemiesHandler {
    enemies = [];
    #amountOfEnemies;
    #killedEnemies = 0;
    #cleared = false;
    #notBeggining = false;
    #clearanceCallback;
    #scene;
    #player;
    //carregador de assets

    constructor(scene, player, amountOfEnemies = 100, clearanceCallback = () => { }) {
        this.#scene = scene;
        this.#player = player;
        this.#amountOfEnemies = amountOfEnemies;
        this.#clearanceCallback = clearanceCallback;
    }

    // Normalize scale and multiple by the newScale
    normalizeAndRescale(obj, newScale) {
        var scale = getMaxSize(obj);
        obj.scale.set(newScale * (1.0 / scale),
            newScale * (1.0 / scale),
            newScale * (1.0 / scale));
        return obj;
    }

    fixPosition(obj) {
        // Fix position of the object over the ground plane
        var box = new THREE.Box3().setFromObject(obj);
        if (box.min.y > 0)
            obj.translateY(-box.min.y);
        else
            obj.translateY(-1 * box.min.y);
        return obj;
    };

    #addModel(enemyName, classThis, enemies, position) {
        if (enemyName == "cacodemon") {
            let gtfLoader = new GLTFLoader();
            gtfLoader.load(`./assets/cacodemon.glb`, function (response) {
                let obj = response.scene;
                if (obj.material) {
                    obj.material.transparent = true;
                }
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.transparent = true;
                    }
                });

                obj = classThis.normalizeAndRescale(obj, 4);
                obj = classThis.fixPosition(obj);

                scene.add(obj);

                enemies.push(new Cacodemon(obj, classThis.#player, position));
            })
        } else if (enemyName == "lostsoul") {
            let mtlLoader = new MTLLoader();
            mtlLoader.load("./assets/skull/skull.mtl", function (materials) {
                materials.preload();

                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load("./assets/skull.obj", function (obj) {

                    obj.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.material.transparent = true;
                        }
                    });

                    obj = classThis.normalizeAndRescale(obj, 3);
                    obj = classThis.fixPosition(obj);
                    scene.add(obj);

                    enemies.push(new LostSoul(obj, classThis.#player, position));
                });
            });
        }
        else {
            let loader = new THREE.TextureLoader();
            let spriteMixer = SpriteMixer();
            let texture = loader.load("./assets/soldier/zombieman.png", (texture) => {
                let actionSprite = spriteMixer.ActionSprite(texture, 8, 8);
                actionSprite.position.set(position.x, position.y, position.z )
                actionSprite.setFrame(0, 0);
                actionSprite.scale.set(5, 5, 5)
                scene.add(actionSprite)
                enemies.push(new Soldier(actionSprite, classThis.#player, position, spriteMixer));
                //console.log('zombie adicionado', enemies)
            })
        }
    }

    addEnemy(enemyName, position) {
        console.log(enemyName)
        this.#addModel(enemyName, this, this.enemies, position);
    }

    handleEnemies() {
        if (this.enemies.length != 0) {
            this.enemies = this.enemies.filter((enemy) => {
                enemy.handle();

                if (enemy.dead) {
                    this.#killedEnemies++;

                    scene.remove(enemy.object);
                    enemy.object.children.forEach((child) => {
                        if (child.isMesh) {
                            child.geometry.dispose();
                            child.material.dispose();
                        }
                    })
                    this.#notBeggining = true;
                    return false;
                }

                return true;
            });
        }

        //console.log(this.enemies, 'enemies')
        if (((this.#killedEnemies === this.#amountOfEnemies) || (this.#notBeggining && this.enemies.length == 0)) && !this.#cleared) {
            console.log("rodou");
            console.log(this.#killedEnemies, this.#amountOfEnemies, this.#killedEnemies === this.#amountOfEnemies);
            this.#clearanceCallback();
            this.#cleared = true;
        }
    }
};