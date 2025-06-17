import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
  initRenderer,
  setDefaultMaterial,
  initDefaultBasicLight,
  onWindowResize,
  createLightSphere
} from "../libs/util/util.js";
import { loadLightPostScene } from "../libs/util/utilScenes.js";

let scene, renderer, camera, orbit;
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(5, 5, 5);
camera.up.set(0, 1, 0);
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

const ambientLight = new THREE.AmbientLight('white', 0.1); // cor branca, intensidade baixa
scene.add(ambientLight);

let position = new THREE.Vector3(1.5, 3, 0);
let lightColor = "rgb(255,255,255)";
let spotLight = new THREE.SpotLight(lightColor, 10.0)
spotLight.position.copy(position);
spotLight.angle = THREE.MathUtils.degToRad(45);
spotLight.target.position.set(3, 0, 0)
spotLight.castShadow = true;
spotLight.decay = 1.5
spotLight.penumbra = 0.4;

scene.add(spotLight);
scene.add(spotLight.target)

spotLight.shadow.mapSize.set(1024, 1024);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(3);
axesHelper.visible = false;
scene.add(axesHelper);

let cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 32)
let cylinder1 = new THREE.Mesh(cylinderGeometry, setDefaultMaterial('yellow'))
cylinder1.position.set(2, 0.4, -2)
cylinder1.castShadow = true
scene.add(cylinder1)

let cylinder2 = new THREE.Mesh(cylinderGeometry, setDefaultMaterial('purple'))
cylinder2.position.set(0, 0.4, 3)
scene.add(cylinder2)

let boxGeometry = new THREE.BoxGeometry(0.5, 1, 0.5, 32)
let box1 = new THREE.Mesh(boxGeometry, setDefaultMaterial())
box1.position.set(4, 0.5, 0)
box1.castShadow = true;
scene.add(box1)

let box2 = new THREE.Mesh(boxGeometry, setDefaultMaterial('green'))
box2.position.set(4, 0.5, 2)
box2.castShadow = true;
scene.add(box2)

let dirPosition = new THREE.Vector3(2, 2, 6)
const dirLight = new THREE.DirectionalLight('white', 0.6);
dirLight.position.copy(dirPosition);
dirLight.target.position.set(0, 0, 0) // para onde os raios estão indo
scene.add(dirLight);
scene.add(dirLight.target)

// Load default scene
loadLightPostScene(scene)

// REMOVA ESTA LINHA APÓS CONFIGURAR AS LUZES DESTE EXERCÍCIO
//initDefaultBasicLight(scene);

//---------------------------------------------------------
// Load external objects
render();


function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}
