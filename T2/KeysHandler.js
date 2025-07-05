import * as THREE from 'three';
import { CSG } from "../libs/other/CSGMesh.js";

export class KeysHandler {

    #scene

    constructor(scene) {
        this.#scene = scene;
    }

    addKey(color) {
        let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        let cube = new THREE.Mesh(cubeGeometry);

        let cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 10);
        let cylinder1 = new THREE.Mesh(cylinderGeometry);
        let cylinder2 = new THREE.Mesh(cylinderGeometry);
        let cylinder3 = new THREE.Mesh(cylinderGeometry);

        cylinder2.rotateX(Math.PI / 2);
        cylinder3.rotateZ(-Math.PI / 2);

        cylinder1.matrixAutoUpdate = false;
        cylinder2.matrixAutoUpdate = false;
        cylinder3.matrixAutoUpdate = false;

        cylinder1.updateMatrix();
        cylinder2.updateMatrix();
        cylinder3.updateMatrix();

        let cubeCSG = CSG.fromMesh(cube);
        let cylinder1CSG = CSG.fromMesh(cylinder1)
        let cylinder2CSG = CSG.fromMesh(cylinder2)
        let cylinder3CSG = CSG.fromMesh(cylinder3)

        let csgObject = cubeCSG.subtract(cylinder1CSG);
        let csgObject1 = csgObject.subtract(cylinder2CSG);
        let csgObject2 = csgObject1.subtract(cylinder3CSG);
        let csgFinal = CSG.toMesh(csgObject2, new THREE.Matrix4())
        csgFinal.material = new THREE.MeshPhongMaterial({
            "color": color,
            "shininess": "200",
            "specular": "rgb(255,255,255)"
        })

        csgFinal.scale.set(0.3, 0.3, 0.3);
        csgFinal.position.set(-160.0, 6.9, -162.0);
        this.#scene.add(csgFinal);
    }
}