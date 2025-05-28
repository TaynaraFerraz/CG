import * as THREE from 'three';
import Stats from '../build/jsm/libs/stats.module.js';
import { PointerLockControls } from '../build/jsm/controls/PointerLockControls.js'
import { Area } from './createArea.js';
import {
    initRenderer,
    initCamera,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    onWindowResize,
    createGroundPlaneXZ,
    createGroundPlane
} from "../libs/util/util.js";
import { PlayerCollisionHandler } from './PlayerCollisionHandler.js';
import { Box3 } from '../build/three.module.js';


let scene, renderer, camera, cameraHolder, material, light; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

//inicio da configuração da camera
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 17, 0);
camera.lookAt(new THREE.Vector3(0.0, 1.0, -100.0));


//criando o camera holder
let cameraHolderGeometry = new THREE.CylinderGeometry(4, 4, 17);
cameraHolder = new THREE.Mesh(cameraHolderGeometry, material);
cameraHolder.position.set(0, 20, 50);
cameraHolder.visible = false; // Esconde o cameraHolder


scene.add(cameraHolder);


cameraHolder.add(camera);




const controls = new PointerLockControls(cameraHolder, renderer.domElement);

const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const crosshair = document.getElementById('crosshair');

//controlam se o mouse está travado ou não
instructions.addEventListener('click', function () {
    
    controls.lock();
    
}, false);

//controlam a notificação de que o mouse está travado ou não
controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    crosshair.style.display = 'block'; // Mostra a mira
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    crosshair.style.display = 'none'; // Esconde a mira
});

scene.add(controls.getObject());

//auxiliares para a movimentação
const speed = 20;
let shift = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

//melhorar isso aqui
window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));

//mapeia as teclas para os movimentos
function movementControls(key, value) {
    switch (key) {
        case 16: // SHIFT
        shift = value;
        break;
        case 87: // W
        moveForward = value;
        break;
        case 83: // S
        moveBackward = value;
        break;
        case 65: // A
        moveLeft = value;
        break;
        case 68: // D
        moveRight = value;
        break;
    }
}

//realiza a movimentação utilizando metodos do PointerLockControls
function moveAnimate(delta) {
    let moveSpeed = shift? 3 * speed * delta : speed * delta;

    if (moveForward) {
        controls.moveForward(moveSpeed);
    }
    else if (moveBackward) {
        controls.moveForward(-moveSpeed);
    }
    
    if (moveRight) {
        controls.moveRight(moveSpeed);
    }
    else if (moveLeft) {
        controls.moveRight(-moveSpeed);
    }
}

//testeMashs()
Area.createMap(scene);

//colisores

/* let collidables = scene.children.map((child) => {
    let boundingBox = new THREE.Box3();
    boundingBox.setFromObject(child);
    return boundingBox;
}) */
let collidables = {
    areas: Area.collidableAreas,
    walls: Area.collidableWalls,
    stairs: Area.collidableStairs
}
let playerCollisionHandler = new PlayerCollisionHandler(scene, cameraHolder, collidables);


// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

const clock = new THREE.Clock();

render();

function render() {
    if (controls.isLocked) {
        moveAnimate(clock.getDelta());
    }

    //lidando com as colisões
    playerCollisionHandler.handleCollisions();

    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}