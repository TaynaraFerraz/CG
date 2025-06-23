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
import { CSG } from '../libs/other/CSGMesh.js';

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
//material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene, true, new THREE.Vector3(0, 2, 10));
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

let auxMat = new THREE.Matrix4();

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
plane.receiveShadow = false;
scene.add(plane);

let bigCylinderGeometry = new THREE.CylinderGeometry(2, 2, 4)
let bigCylinder = new THREE.Mesh(bigCylinderGeometry)

let smallCylinderGeometry = new THREE.CylinderGeometry(1.7, 1.8, 4)
let smallCylinder = new THREE.Mesh(smallCylinderGeometry)

let cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
let cube = new THREE.Mesh(cubeGeometry)

let torusGeometry = new THREE.TorusGeometry(1.5, 0.3)
let torus = new THREE.Mesh(torusGeometry)

let csgObject, cubeCSG, cylinder1CSG, cylinder2CSG, torusCSG, totalCylinder, finalMesh

cube.position.set(-2, 0, 0)
updateObject(cube) // update internal coords
torusCSG = CSG.fromMesh(torus)
cubeCSG = CSG.fromMesh(cube)
csgObject = torusCSG.subtract(cubeCSG) // Execute subtraction
torus = CSG.toMesh(csgObject, auxMat)
torus.position.set(6, 2.5, 0)
torus.castShadow = false

cylinder1CSG = CSG.fromMesh(bigCylinder)
cylinder2CSG = CSG.fromMesh(smallCylinder)
csgObject = cylinder1CSG.subtract(cylinder2CSG)
bigCylinder = CSG.toMesh(csgObject, auxMat)
bigCylinder.position.set(0, 2, 0)
bigCylinder.castShadow = false

torus.position.set(2, 0, 0)
updateObject(torus) 
torusCSG = CSG.fromMesh(torus)
totalCylinder = CSG.fromMesh(bigCylinder)

csgObject = totalCylinder.union(torusCSG)
finalMesh = CSG.toMesh(csgObject, auxMat)
finalMesh.material = new THREE.MeshPhongMaterial({
    "color": "rgb(46, 89, 230)",
    "shininess": "200",
    "specular": "rgb(255,255,255)"
})
finalMesh.position.set(0, 2, 0)
scene.add(finalMesh)

// Use this to show information onscreen
let controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

function updateObject(mesh) {
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
}

render();
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}