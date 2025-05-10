import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ
} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
let cube = new THREE.Mesh(cubeGeometry, material);
// position the cube
cube.position.set(0.0, 3.0, 0.0);
cube.scale.set(11, 0.3, 6);
// add the cube to the scene
scene.add(cube);

for (var i = -0.45; i <= 0.45; i = i + 0.9) {
  for (var j = -0.45; j <= 0.45; j = j + 0.9) {
    let cylinderGeometry1 = new THREE.CylinderGeometry(0.1, 0.1, 3, 32)// raio do cilindo no topo, raio do cilindro embaixo
    let cylinderMateria1 = setDefaultMaterial('lightgreen')
    let cylinder1 = new THREE.Mesh(cylinderGeometry1, cylinderMateria1)
    cylinder1.scale.set(1 / 11, 1 / 0.3, 1 / 6);
    cylinder1.position.set(i, -5, j)
    cube.add(cylinder1)
  }
}

// Use this to show information onscreen
let controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}