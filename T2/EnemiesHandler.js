import * as THREE from 'three';
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { getMaxSize } from "../libs/util/util.js";
import { Cacodemon } from "./Cacodemon.js";
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { LostSoul } from './LostSoul.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import { scene } from './camera.js';

export class EnemiesHandler {
    #enemies = [];
    #amountOfEnemies;
    #killedEnemies = 0;
    #cleared = false;
    #clearanceCallback;
    #scene;
    #player;
    //carregador de assets

    constructor(scene, player, amountOfEnemies, clearanceCallback) {
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

    #addModel(enemyName, classThis, enemies) {
        if (enemyName == "cacodemon") {
            let gtfLoader = new GLTFLoader();
            gtfLoader.load(`./assets/cacodemon.glb`, function (response) {
                let obj = response.scene;
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                obj = classThis.normalizeAndRescale(obj, 2);
                obj = classThis.fixPosition(obj);
                
                scene.add(obj);
                
                enemies.push(new Cacodemon(obj, classThis.#player));
            })
        } else {
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
                        }
                    });
                    
                    obj = classThis.normalizeAndRescale(obj, 2);
                    obj = classThis.fixPosition(obj);
                    scene.add(obj);
                    
                    enemies.push(new LostSoul(obj, classThis.#player));
                });
            });
        }
    }
    
    addEnemy(enemyName) {
        this.#addModel(enemyName, this, this.#enemies);
    }

    handleEnemies() {
        this.#enemies.filter((enemy) => {
            enemy.handle();

            if(enemy.dead){
                this.#killedEnemies++;
                scene.remove(enemy);
                enemy.geometry.dispose();
                enemy.material.dispose();
                enemy = undefined;
                return false;
            }

            if(this.#killedEnemies == this.#amountOfEnemies && !this.#cleared){
                this.#clearanceCallback();
                this.#cleared = true;
            }
            return true;
        });
    }
};