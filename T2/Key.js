import * as THREE from 'three';
import { CSG } from "../libs/other/CSGMesh.js";

export class Key {

    position
    color
    material
    csgFinal
    coletada = false

    constructor(color) {
        this.color = color;
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
        this.csgFinal = CSG.toMesh(csgObject2, new THREE.Matrix4())
        this.material = new THREE.MeshPhongMaterial({
            "color": color,
            "shininess": "200",
            "specular": "rgb(255,255,255)"
        })
        this.csgFinal.material = this.material
        this.csgFinal.scale.set(0.3, 0.3, 0.3);
        //this.position = this.csgFinal.position.set(-160.0, 6.9, -162.0);
        //this.#scene.add(this.csgFinal);
    }

    removeKey() {
        if (this.coletada) return;

        this.csgFinal.visible = false
        this.coletada = true;

    }
}