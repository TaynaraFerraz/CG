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
//consigo usar o pointerLockcontrol junto com um camera Holder?
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3); //posição no mundo
camera.lookAt(new THREE.Vector3(0.0, 17.5, 0.0));


//criando o camera holder

let cameraHolderGeometry = new THREE.BoxGeometry(4, 4, 4);
cameraHolder = new THREE.Mesh(cameraHolderGeometry, material);
cameraHolder.position.set(200, 50.5, -80);

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
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

//melhorar isso aqui
//se tu consegue de algum jeito clicar fora ele trava kkkkkk
window.addEventListener('keydown', (event) => movementControls(event.keyCode, true));
window.addEventListener('keyup', (event) => movementControls(event.keyCode, false));

//mapeia as teclas para os movimentos
function movementControls(key, value) {
    switch (key) {
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
    if (moveForward) {
        controls.moveForward(speed * delta);
    }
    else if (moveBackward) {
        controls.moveForward(speed * -1 * delta);
    }
    
    if (moveRight) {
        controls.moveRight(speed * delta);
    }
    else if (moveLeft) {
        controls.moveRight(speed * -1 * delta);
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
    walls: Area.collidableWalls
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