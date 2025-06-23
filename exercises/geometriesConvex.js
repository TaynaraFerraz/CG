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
import { ConvexGeometry } from '../build/jsm/geometries/ConvexGeometry.js';

let scene, renderer, camera, material, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
var light = initDefaultBasicLight(scene, true, new THREE.Vector3(0, 8, 10)); 
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
plane.receiveShadow = true;
scene.add(plane);

var object = null;
var convexGeometry = null;

var objColor = "rgb(230, 20, 125)";
var objOpacity = 0.5;

// Object Material
var objectMaterial = new THREE.MeshPhongMaterial({
    color: objColor,
    opacity: objOpacity
});

//var points = [];
var positions = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(8, 0, 0), new THREE.Vector3(8, 0, -4), new THREE.Vector3(0, 0, -4), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 3, -4), new THREE.Vector3(4, 3, 0), new THREE.Vector3(4, 3, -4)];

convexGeometry = new ConvexGeometry(positions);

object = new THREE.Mesh(convexGeometry, objectMaterial);
object.castShadow = true;
object.visible = true;
scene.add(object);

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