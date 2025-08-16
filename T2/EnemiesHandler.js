import * as THREE from 'three';
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { getMaxSize } from "../libs/util/util.js";
import { Cacodemon } from "./Cacodemon.js";
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { LostSoul } from './LostSoul.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import { scene } from './camera.js';
import { PainElemental } from './PainElemental.js';

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

    #addModel(enemyName, classThis, position, startAngry = false) {
        function bakeRotation(object3D, rotation) {
            const matrix = new THREE.Matrix4();
            matrix.makeRotationFromEuler(rotation);

            object3D.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.applyMatrix4(matrix);
                    child.geometry.computeVertexNormals(); // normals must be updated
                }
            });
        }

        if (enemyName == "cacodemon") {
            let gtfLoader = new GLTFLoader();
            gtfLoader.load(`../0_assetsT3/objects/cacodemon.glb`, function (response) {
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
                
                classThis.enemies.push(new Cacodemon(obj, classThis.#player, position));
            })
        } else if (enemyName == "lostsoul") {
            let mtlLoader = new MTLLoader();
            mtlLoader.load("../0_assetsT3/objects/skull/skull.mtl", function (materials) {
                materials.preload();

                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load("../0_assetsT3/objects/skull.obj", function (obj) {

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
                    const lostSoul = new LostSoul(obj, classThis.#player, position);
                    if(startAngry){
                        lostSoul.angry = true;
                        lostSoul.dashing = true;
                    }
                    classThis.enemies.push(lostSoul);
                });
            });
        } else if (enemyName == "painelemental") {
            let gtfLoader = new GLTFLoader();
            gtfLoader.load(`../0_assetsT3/objects/pain/painElemental.glb`, function (response) {
                let obj = response.scene;
                bakeRotation(obj, new THREE.Euler(0, Math.PI / 2, 0));
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

                obj = classThis.normalizeAndRescale(obj, 6);
                obj = classThis.fixPosition(obj);

                scene.add(obj);
                
                const painElemental = new PainElemental(obj, classThis.#player, position, classThis);
                classThis.enemies.push(painElemental);
            })
        }
    }

    addEnemy(enemyName, position, startAngry) {
        this.#addModel(enemyName, this, position, startAngry);
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


        if (((this.#notBeggining && this.enemies.length == 0)) && !this.#cleared) {
            this.#clearanceCallback();
            this.#cleared = true;
        }
    }
};