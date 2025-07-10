import * as THREE from 'three';
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { getMaxSize } from "../libs/util/util.js";
import { Cacodemon } from "./Cacodemon.js";
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { LostSoul } from './LostSoul.js';

export class EnemiesHandler {
    #enemies = [];
    #loader = {};
    #GLTFLoader = new GLTFLoader();
    #OBJLoader = new OBJLoader();
    #scene;
    #player;
    //carregador de assets

    constructor(scene, player) {
        this.#scene = scene;
        this.#player = player;
    }

    // Normalize scale and multiple by the newScale
    #normalizeAndRescale(obj, newScale) {
        var scale = getMaxSize(obj);
        obj.scale.set(newScale * (1.0 / scale),
            newScale * (1.0 / scale),
            newScale * (1.0 / scale));
        return obj;
    }

    #fixPosition(obj) {
        // Fix position of the object over the ground plane
        var box = new THREE.Box3().setFromObject(obj);
        if (box.min.y > 0)
            obj.translateY(-box.min.y);
        else
            obj.translateY(-1 * box.min.y);
        return obj;
    };
    addEnemy(enemyName) {
        let customPath = '';
        switch(enemyName) {
            case "cacodemon":
                customPath = "cacodemon.glb"
            break;
            case "lostsoul":
                customPath = "skull.obj"
        }

        this.#loader = enemyName == "cacodemon"? this.#GLTFLoader : this.#OBJLoader;
        this.#loader.load(`./assets/${customPath}`, (response) => {
            console.log(enemyName);
            let obj = enemyName == "cacodemon"? response.scene : response;

            
            obj.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                //if (child.material) child.material.side = THREE.DoubleSide;
            });

            obj = this.#normalizeAndRescale(obj, 2);
            obj = this.#fixPosition(obj);
            let enemy = enemyName == "cacodemon"? new Cacodemon(obj, this.#player) : new LostSoul(obj, this.#player);;
            this.#scene.add(obj);
            this.#enemies.push(enemy);
        })
    }

    handleEnemies() {
        this.#enemies.forEach((enemy) => {
            enemy.handle();
        });
    }
};