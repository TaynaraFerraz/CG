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
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
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

const lerpConfigSphere = {
    destination: new THREE.Vector3(9, 1, -4),
    alpha: 0.05,
    move: false
}

const lerpConfigSphere2 = {
    destination: new THREE.Vector3(9, 1, 4),
    alpha: 0.03,
    move: false
}

buildInterface()
render();

function buildInterface() {

    var controls = new function () {
        this.MoveSphere1 = function () {
            lerpConfigSphere.move = true
            lerpConfigSphere.destination = new THREE.Vector3(9, 1, -4)
        };

        this.MoveSphere2 = function () {
            lerpConfigSphere2.move = true
            lerpConfigSphere2.destination = new THREE.Vector3(9, 1, 4)
        };

        this.Reset = function () {
            lerpConfigSphere.move = true
            lerpConfigSphere2.move = true

            lerpConfigSphere2.destination = new THREE.Vector3(-9, 1, 4)
            lerpConfigSphere.destination = new THREE.Vector3(-9, 1, -4)
        };
    };

    // GUI interface
    var gui = new GUI();
    gui.add(controls, 'MoveSphere1').name("Mover esfera 1");
    gui.add(controls, 'MoveSphere2').name("Mover esfera 2");
    gui.add(controls, 'Reset').name("Resetar");

}

function render() {

    trackballControls.update();

    if (lerpConfigSphere.move) sphere.position.lerp(lerpConfigSphere.destination, lerpConfigSphere.alpha);
    if (lerpConfigSphere2.move) sphere2.position.lerp(lerpConfigSphere2.destination, lerpConfigSphere2.alpha);

    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}