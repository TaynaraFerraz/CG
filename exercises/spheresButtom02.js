import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
    initRenderer,
    initCamera,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    onWindowResize,
    createGroundPlaneXZ,
    initTrackballControls
} from "../libs/util/util.js";
import GUI from '../libs/util/dat.gui.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
var stats = new Stats();
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
let sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)

let sphere2 = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere2)

sphere.position.set(-9, 1, -4)
sphere2.position.set(-9, 1, 4)

let sphereCurrentPos = new THREE.Vector3(-9.0, 1.0, -4.0)
let sphereTarget = new THREE.Vector3(9.0, 1.0, -4.0)
let animateSphere = false

let sphereCurrentPos2 = new THREE.Vector3(-9.0, 1.0, 4.0)
let sphereTarget2 = new THREE.Vector3(9.0, 1.0, 4.0)
let animate2 = false

let reset = false

buildInterface()
render();

function buildInterface() {

    var controls = new function () {
        this.MoveSphere1 = function () {
            animateSphere = true  // definir essas atribuições para nenhuma atividade atrapalhar a outra
            reset = false
        };

        this.MoveSphere2 = function () {
            animate2 = true
            reset = false
        };

        this.Reset = function () {
            reset = true
            animateSphere = false
            animate2 = false
        };
    };

    // GUI interface
    var gui = new GUI();
    gui.add(controls, 'MoveSphere1').name("Mover esfera 1");
    gui.add(controls, 'MoveSphere2').name("Mover esfera 2");
    gui.add(controls, 'Reset').name("Resetar");

}

function MoveSphere() {
    sphere.matrixAutoUpdate = false;
    sphere.matrix.identity();
    var mat4 = new THREE.Matrix4();
    var alpha = 0.05;

    sphereTarget.set(9.0, 1.0, -4.0)

    sphereCurrentPos.x += (sphereTarget.x - sphereCurrentPos.x) * alpha; // utilizando a descrição da função lerp
    sphereCurrentPos.y += (sphereTarget.y - sphereCurrentPos.y) * alpha;
    sphereCurrentPos.z += (sphereTarget.z - sphereCurrentPos.z) * alpha;

    sphere.matrix.multiply(mat4.makeTranslation(sphereCurrentPos.x, sphereCurrentPos.y, sphereCurrentPos.z));
}

function MoveSphere2() {
    sphere2.matrixAutoUpdate = false;
    sphere2.matrix.identity();
    var mat4 = new THREE.Matrix4();
    var alpha = 0.05;

    sphereTarget2.set(9.0, 1.0, 4.0)

    sphereCurrentPos2.x += (sphereTarget2.x - sphereCurrentPos2.x) * alpha; // utilizando a descrição da função lerp
    sphereCurrentPos2.y += (sphereTarget2.y - sphereCurrentPos2.y) * alpha;
    sphereCurrentPos2.z += (sphereTarget2.z - sphereCurrentPos2.z) * alpha;

    sphere2.matrix.multiply(mat4.makeTranslation(sphereCurrentPos2.x, sphereCurrentPos2.y, sphereCurrentPos2.z));
}

function Resetar() {
    sphere.matrixAutoUpdate = false;
    sphere2.matrixAutoUpdate = false;
    sphere.matrix.identity();
    sphere2.matrix.identity();

    var mat4 = new THREE.Matrix4();
    var alpha = 0.05;

    sphereCurrentPos.set(-9.0, 1.0, -4.0)
    sphereCurrentPos2.set(-9.0, 1.0, 4.0)

    sphereTarget.x += (sphereCurrentPos.x - sphereTarget.x) * alpha; // utilizando a descrição da função lerp
    sphereTarget.y += (sphereCurrentPos.y - sphereTarget.y) * alpha;
    sphereTarget.z += (sphereCurrentPos.z - sphereTarget.z) * alpha;

    sphereTarget2.x += (sphereCurrentPos2.x - sphereTarget2.x) * alpha; // utilizando a descrição da função lerp
    sphereTarget2.y += (sphereCurrentPos2.y - sphereTarget2.y) * alpha;
    sphereTarget2.z += (sphereCurrentPos2.z - sphereTarget2.z) * alpha;

    sphere.matrix.multiply(mat4.makeTranslation(sphereTarget.x, sphereTarget.y, sphereTarget.z));
    sphere2.matrix.multiply(mat4.makeTranslation(sphereTarget2.x, sphereTarget2.y, sphereTarget2.z));
    
}

function render() {

    trackballControls.update();
    if (animateSphere) {
        MoveSphere()
    }

    if (animate2) {
        MoveSphere2()
    }

    if (reset) {
        Resetar()
    }
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}