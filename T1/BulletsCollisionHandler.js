import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';
import {
    initRenderer,
    initDefaultSpotlight,
    createGroundPlaneXZ,
    SecondaryBox,
    onWindowResize,
    setDefaultMaterial,
    initCamera
} from "../libs/util/util.js";

const spheres = []; 

class Sphere {

    sphere
    destination
    alpha
    move

    constructor(position) {
        const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 16);
        const materialSphere = setDefaultMaterial('lightblue')
        this.sphere = new THREE.Mesh(sphereGeometry, materialSphere);
        scene.add(this.sphere)
        this.sphere.position.set(0, 0.2, 2.8)
        this.destination = new THREE.Vector3(0, 0.2, -10);
        this.alpha = 0.05;
        this.move = true;
    }

    update() {
        if(this.move) {
            this.sphere.position.lerp(this.destination, this.alpha);

            // Verifica se já chegou perto do destino 
            if(this.sphere.position.distanceTo(this.destination) < 0.001) {
                this.move = false;
            }
        }
    }

    remove() {
        scene.remove(this.sphere)
    }
}

let scene, renderer, light, camera, keyboard;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();   
light = initDefaultSpotlight(scene, new THREE.Vector3(5.0, 5.0, 5.0)); // Use default light    
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
camera = initCamera(new THREE.Vector3(10, 2, 2));


let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper)
var groundPlane = createGroundPlaneXZ(10, 10); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

const wallGeometry = new THREE.PlaneGeometry(15, 15);
const wallMaterial = setDefaultMaterial();
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
scene.add(wall);
wall.position.set(0, 0, -10);

// Create objects
let geometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 26)
let material = setDefaultMaterial()
let cylinder = new THREE.Mesh(geometry, material)
cylinder.rotateX(Math.PI / 2);
cylinder.position.set(0, 0.2, 4);
scene.add(cylinder)

function keyboardUpdate() {
    keyboard.update();
    if (keyboard.down("space")){  //A função pressed retorna true enquanto a tecla estiver segurada, o que pode ser dezenas de frames (ou seja, gera vários disparos muito rápidos).Já a função down retorna true só uma vez no frame em que a tecla foi pressionada, evitando múltiplas bolinhas criadas.
        const novaSphere = new Sphere();
        spheres.push(novaSphere);
    } 
    
}

render();
function render() {
    requestAnimationFrame(render);
    keyboardUpdate()
    let boxWall = new THREE.Box3().setFromObject(wall);

    for (let i = spheres.length - 1; i >= 0; i--) {
        const s = spheres[i];
        s.update();

        let boxSphere = new THREE.Box3().setFromObject(s.sphere);

        if (boxSphere.intersectsBox(boxWall)) {
            s.remove();
            spheres.splice(i, 1);  // A partir da posição i, remove 1 elemento do array
        }
    }

    renderer.render(scene, camera) // Render scene
}