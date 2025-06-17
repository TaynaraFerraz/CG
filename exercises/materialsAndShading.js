import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';

let scene, renderer, camera, material, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer

camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
//light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const lightDirection = new THREE.DirectionalLight( 0xffffff, 1);
lightDirection.shadow.mapSize.width = 2048
lightDirection.shadow.mapSize.height = 2048 // nitidez na sombra

lightDirection.shadow.camera.left = -20;
lightDirection.shadow.camera.right = 20;
lightDirection.shadow.camera.top = 20;
lightDirection.shadow.camera.bottom = -20;
lightDirection.shadow.camera.near = 1;
lightDirection.shadow.camera.far = 50;

lightDirection.position.set( 12, 6, 14); 
lightDirection.castShadow = true; 
scene.add( lightDirection );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(50, 50)
plane.receiveShadow = true
scene.add(plane);

let sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
let sphereMaterial = new THREE.MeshLambertMaterial({
    color: "rgb(144, 238, 144)"
})
let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.receiveShadow = true
sphere.castShadow = true
sphere.position.set(-6, 2, -6)
scene.add(sphere)

let teapotGeometry = new TeapotGeometry(2)
let teapotMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(255,20,20)",
    shininess: "200",
    specular: "rgb(255,255,255)"
})
let teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
teapot.receiveShadow = true
teapot.castShadow = true
teapot.position.set(0, 1.5, 0)
scene.add(teapot)

let cylinderGeometry = new THREE.CylinderGeometry(0.5, 3, 8, 32)
let cylinderMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(137, 207, 240)",
    flatShading: true
})
let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
cylinder.castShadow = true
cylinder.position.set(6, 4, 6)
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