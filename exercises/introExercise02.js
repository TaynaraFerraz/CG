import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial('lightgreen'); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let cubeGeometry1 = new THREE.BoxGeometry(4, 4, 4);
let cube1 = new THREE.Mesh(cubeGeometry1, material);

let sphereGeometry = new THREE.SphereGeometry( 2, 32, 16 ); 
let sphereMaterial = setDefaultMaterial('lightblue')
let sphere = new THREE.Mesh( sphereGeometry, sphereMaterial ); 

let cylinderGeometry = new THREE.CylinderGeometry(2, 2, 6, 32)// raio do cilindo no topo, raio do cilindro embaixo
let cylinderMateria = setDefaultMaterial()
let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMateria)

// position the cube
cube1.position.set(0.0, 2.0, 0.0);
sphere.position.set(6.0, 2.0, 0.0)
cylinder.position.set(-6.0, 3.0, 0.0)

// add the cube to the scene
scene.add(cube1);
scene.add( sphere );
scene.add(cylinder)

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
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}